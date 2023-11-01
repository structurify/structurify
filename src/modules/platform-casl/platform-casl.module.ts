import { Module } from '@nestjs/common';

import { PlatformCaslAbilityFactory } from './factories';

@Module({
  providers: [PlatformCaslAbilityFactory],
  exports: [PlatformCaslAbilityFactory],
})
export class PlatformCaslModule {}
