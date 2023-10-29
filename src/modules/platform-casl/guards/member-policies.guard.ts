import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { MembersService } from '@modules/organizations/services';

import { CHECK_PLATFORM_POLICIES_KEY } from '../constants';
import { AppAbility, PlatformCaslAbilityFactory } from '../factories';
import { PlatformPolicyHandler } from '../interfaces';

@Injectable()
export class PlatformMemberPoliciesGuard implements CanActivate {
  private readonly logger = new Logger(PlatformMemberPoliciesGuard.name);

  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: PlatformCaslAbilityFactory,
    private membersService: MembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PlatformPolicyHandler[]>(
        CHECK_PLATFORM_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const ctx = GqlExecutionContext.create(context);
    const { user, organizationId } = ctx.getContext().req;
    if (!user) {
      this.logger.debug('user is not defined');
      return false;
    }

    if (!organizationId) {
      this.logger.debug('organizationId is not defined');
      return false;
    }

    const member = await this.membersService.findOne(organizationId, user.id);
    if (!member) {
      this.logger.debug('member is not defined');
      return false;
    }

    const ability = this.caslAbilityFactory.createForMember(member);

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
