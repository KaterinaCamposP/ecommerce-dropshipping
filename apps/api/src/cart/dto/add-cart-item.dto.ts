import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    description: 'ID del producto a agregar al carrito',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1k',
  })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description:
      'Cantidad a agregar. Si el producto ya está en el carrito, se suma a la cantidad existente. Por defecto 1.',
    example: 2,
    required: false,
    default: 1,
  })
  @IsInt()
  @Min(1)
  quantity?: number;
}
