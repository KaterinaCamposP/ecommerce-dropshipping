import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@ApiHeader({
  name: 'x-session-id',
  description: 'ID de sesión para carritos de invitados',
  required: false,
})
@ApiBearerAuth()
@Controller('cart')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el carrito actual (usuario o invitado)' })
  async getCart(
    @CurrentUser() user: { id: string } | undefined,
    @CurrentSession() sessionId?: string,
  ): Promise<CartResponseDto> {
    console.log('DEBUG - user:', user);
    console.log('DEBUG - sessionId:', sessionId);
    console.log('DEBUG - user?.id:', user?.id);
    return this.cartService.getCart({
      userId: user?.id,
      sessionId,
    });
  }

  @Post('items')
  @HttpCode(200)
  @ApiOperation({ summary: 'Agregar un producto al carrito' })
  async addItem(
    @CurrentUser() user: { id: string } | undefined,
    @CurrentSession() sessionId: string | undefined,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem({ userId: user?.id, sessionId }, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Actualizar la cantidad de un item del carrito' })
  @ApiParam({ name: 'itemId', description: 'ID del CartItem' })
  async updateItem(
    @CurrentUser() user: { id: string } | undefined,
    @CurrentSession() sessionId: string | undefined,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(
      { userId: user?.id, sessionId },
      itemId,
      dto,
    );
  }

  @Delete('items/:itemId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un item del carrito' })
  @ApiParam({ name: 'itemId', description: 'ID del CartItem' })
  async removeItem(
    @CurrentUser() user: { id: string } | undefined,
    @CurrentSession() sessionId: string | undefined,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    return this.cartService.removeItem({ userId: user?.id, sessionId }, itemId);
  }
}
