import { SetMetadata } from '@nestjs/common';

import { CHECK_PLATFORM_POLICIES_KEY } from '../constants';
import { PlatformPolicyHandler } from '../interfaces';

export const CheckPlatformPolicies = (...handlers: PlatformPolicyHandler[]) =>
  SetMetadata(CHECK_PLATFORM_POLICIES_KEY, handlers);
