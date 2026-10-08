import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Nueva cantidad absoluta del item en el carrito',
    example: 3,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
