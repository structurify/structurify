import { Module } from '@nestjs/common';
import { PlatformCaslAbilityFactory } from './factories/ability.factory';

@Module({
  providers: [PlatformCaslAbilityFactory],
  exports: [PlatformCaslAbilityFactory],
})
export class PlatformCaslModule {}
