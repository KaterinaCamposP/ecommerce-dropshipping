import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export interface CartIdentity {
  userId?: string;
  sessionId?: string;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(identity: CartIdentity) {
    throw new NotImplementedException('Cart logic pending: Lote 3');
  }

  async addItem(identity: CartIdentity, dto: AddCartItemDto) {
    throw new NotImplementedException('Cart logic pending: Lote 3');
  }

  async updateItem(
    identity: CartIdentity,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    throw new NotImplementedException('Cart logic pending: Lote 3');
  }

  async removeItem(identity: CartIdentity, itemId: string) {
    throw new NotImplementedException('Cart logic pending: Lote 3');
  }
}
