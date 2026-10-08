import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@ApiHeader({
  name: 'x-session-id',
  description: 'ID de sesión para carritos de invitados',
  required: false,
})
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el carrito actual (usuario o invitado)' })
  getCart(@CurrentSession() sessionId?: string) {
    return this.cartService.getCart({ sessionId });
  }

  @Post('items')
  @HttpCode(200)
  @ApiOperation({ summary: 'Agregar un producto al carrito' })
  addItem(
    @CurrentSession() sessionId: string | undefined,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem({ sessionId }, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Actualizar la cantidad de un item del carrito' })
  @ApiParam({ name: 'itemId', description: 'ID del CartItem' })
  updateItem(
    @CurrentSession() sessionId: string | undefined,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem({ sessionId }, itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un item del carrito' })
  @ApiParam({ name: 'itemId', description: 'ID del CartItem' })
  removeItem(
    @CurrentSession() sessionId: string | undefined,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem({ sessionId }, itemId);
  }
}
