import { ApiProperty } from '@nestjs/swagger';

class CartItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ type: () => Object })
  product!: {
    id: string;
    title: string;
    price: number;
    stock: number;
    imageUrl: string | null;
  };
}

export class CartResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: () => [CartItemResponseDto] })
  items!: CartItemResponseDto[];

  @ApiProperty({ description: 'Total del carrito calculado' })
  total!: number;
}
