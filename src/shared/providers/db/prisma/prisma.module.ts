import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaService } from './services';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
