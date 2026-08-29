import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() hace que este módulo esté disponible en toda la aplicación
// sin tener que importarlo en cada módulo (como Auth o Users).
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
