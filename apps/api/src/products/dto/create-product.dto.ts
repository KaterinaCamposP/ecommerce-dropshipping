import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Polera oversize blanca' })
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiPropertyOptional({ example: 'Polera 100% algodón, corte oversize' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 19990 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({ example: 'https://ejemplo.com/polera.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Ropa' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
