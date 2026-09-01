import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryProductsDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página (empieza en 1)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de productos por página',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    example: 'Ropa',
    description: 'Filtrar por categoría',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: 'polera',
    description: 'Buscar en título y descripción',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 10000, description: 'Precio mínimo' })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Precio máximo' })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;
}
