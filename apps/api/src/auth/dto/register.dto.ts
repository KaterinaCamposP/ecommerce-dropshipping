import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Katerina Campos' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'katerina@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'password must contain at least one uppercase, one lowercase and one number',
  })
  password!: string;
}
