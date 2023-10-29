import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { CHECK_PLATFORM_POLICIES_KEY } from '../constants';
import { AppAbility, PlatformCaslAbilityFactory } from '../factories';
import { PlatformPolicyHandler } from '../interfaces';

@Injectable()
export class PlatformUserPoliciesGuard implements CanActivate {
  private readonly logger = new Logger(PlatformUserPoliciesGuard.name);

  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: PlatformCaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PlatformPolicyHandler[]>(
        CHECK_PLATFORM_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;
    if (!user) {
      this.logger.debug('user is not defined');
      return false;
    }

    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(
    handler: PlatformPolicyHandler,
    ability: AppAbility,
  ) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
