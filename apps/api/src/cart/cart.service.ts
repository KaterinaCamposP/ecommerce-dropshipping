import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export interface CartIdentity {
  userId?: string;
  sessionId?: string;
}

type CartWithItems = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(identity: CartIdentity): Promise<CartResponseDto> {
    const cart = await this.findOrCreateCart(identity);
    return this.mapCartToResponse(cart);
  }

  async addItem(
    identity: CartIdentity,
    dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.findOrCreateCart(identity);
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || !product.active) {
      throw new NotFoundException('Product not found or inactive');
    }

    const quantityToAdd = dto.quantity ?? 1;
    const existingItem = cart.items.find(
      (item) => item.productId === dto.productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityToAdd;
      if (newQuantity > product.stock) {
        throw new ConflictException(
          `Insufficient stock. Available: ${product.stock}`,
        );
      }
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      if (quantityToAdd > product.stock) {
        throw new ConflictException(
          `Insufficient stock. Available: ${product.stock}`,
        );
      }
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: quantityToAdd,
        },
      });
    }

    return this.mapCartToResponse(await this.reloadCart(cart.id));
  }

  async updateItem(
    identity: CartIdentity,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.findOrCreateCart(identity);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.quantity > product.stock) {
      throw new ConflictException(
        `Insufficient stock. Available: ${product.stock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.mapCartToResponse(await this.reloadCart(cart.id));
  }

  async removeItem(identity: CartIdentity, itemId: string): Promise<void> {
    const cart = await this.findOrCreateCart(identity);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async mergeCarts(sessionCartId: string, userId: string): Promise<void> {
    const userCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    const sessionCart = await this.prisma.cart.findUnique({
      where: { id: sessionCartId },
      include: { items: { include: { product: true } } },
    });

    if (!sessionCart) {
      return;
    }

    if (!userCart) {
      await this.prisma.cart.update({
        where: { id: sessionCartId },
        data: { userId, sessionId: null },
      });
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const sessionItem of sessionCart.items) {
        const userItem = userCart.items.find(
          (i) => i.productId === sessionItem.productId,
        );

        if (userItem) {
          const finalQuantity = Math.min(
            userItem.quantity + sessionItem.quantity,
            sessionItem.product.stock,
          );
          await tx.cartItem.update({
            where: { id: userItem.id },
            data: { quantity: finalQuantity },
          });
          await tx.cartItem.delete({
            where: { id: sessionItem.id },
          });
        } else {
          await tx.cartItem.update({
            where: { id: sessionItem.id },
            data: { cartId: userCart.id },
          });
        }
      }

      await tx.cart.delete({
        where: { id: sessionCartId },
      });
    });
  }

  private async findOrCreateCart(
    identity: CartIdentity,
  ): Promise<CartWithItems> {
    if (!identity.userId && !identity.sessionId) {
      throw new BadRequestException('Either userId or sessionId is required');
    }

    const where = identity.userId
      ? { userId: identity.userId }
      : { sessionId: identity.sessionId as string };

    let cart = await this.prisma.cart.findFirst({
      where,
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId: identity.userId,
          sessionId: identity.sessionId,
        },
        include: { items: { include: { product: true } } },
      });
    }

    return cart;
  }

  private async reloadCart(cartId: string): Promise<CartWithItems> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  private mapCartToResponse(cart: CartWithItems): CartResponseDto {
    const rawTotal = cart.items.reduce(
      (sum, item) => sum + item.product.price.toNumber() * item.quantity,
      0,
    );

    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price.toNumber(),
          stock: item.product.stock,
          imageUrl: item.product.imageUrl,
        },
      })),
      total: Math.round(rawTotal * 100) / 100,
    };
  }
}
