import { Logger, UseGuards } from '@nestjs/common';
import {
  Args,
  Query,
  Mutation,
  Resolver,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { JwtAuthGuard } from '@modules/auth/guards';
import { User } from '@prisma/client';

import {
  Invite,
  Organization,
  InvitesResponse,
  InvitesArgs,
  SendInviteInput,
  ResendInviteInput,
  CancelInviteInput,
  AcceptInviteInput,
} from '@contracts/organizations';
import { CurrentUser } from '@decorators/current-user.decorator';
import { Action } from '@contracts/casl';
import {
  AppAbility,
  CheckPlatformPolicies,
  PlatformMemberPoliciesGuard,
  PlatformUserPoliciesGuard,
} from '@modules/platform-casl';

import {
  OrganizationsService,
  MembersService,
  InvitesService,
} from '../services';

@UseGuards(JwtAuthGuard)
@Resolver((_) => Invite)
export class InviteResolver {
  private readonly logger = new Logger(InviteResolver.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly organizationsService: OrganizationsService,
    private readonly invitesService: InvitesService,
  ) {}

  @ResolveField((_) => Organization)
  async organization(@Parent() root: Invite) {
    return this.organizationsService.findOneById(root.organizationId);
  }

  @UseGuards(PlatformUserPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Invite'),
  )
  @Query((_) => Invite, { nullable: true })
  async invite(@Args('id') id: string) {
    return this.invitesService.findOneById(id);
  }

  @UseGuards(PlatformMemberPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Invite'),
  )
  @Query((_) => InvitesResponse)
  async invites(@Args() input: InvitesArgs): Promise<InvitesResponse> {
    const { skip, take } = input;
    const [items = [], count] = await this.invitesService.findAll(input);

    return {
      items,
      meta: {
        skip,
        take,
        count,
      },
    };
  }

  @UseGuards(PlatformMemberPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Create, 'Invite'),
  )
  @Mutation((_) => Invite)
  async inviteSend(
    @Args('input') input: SendInviteInput,
    @CurrentUser() user: User,
  ) {
    return this.invitesService.sendInvite({
      createdBy: {
        user: user.id,
      },
      ...input,
    });
  }

  @UseGuards(PlatformMemberPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'Invite'),
  )
  @Mutation((_) => Invite)
  async inviteResend(
    @Args('input') input: ResendInviteInput,
    @CurrentUser() user: User,
  ) {
    return this.invitesService.resendInvite({
      updatedBy: {
        user: user.id,
      },
      ...input,
    });
  }

  @UseGuards(PlatformMemberPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, 'Invite'),
  )
  @Mutation((_) => Invite)
  async inviteCancel(
    @Args('input') input: CancelInviteInput,
    @CurrentUser() user: User,
  ) {
    return this.invitesService.cancelInvite({
      deletedBy: {
        user: user.id,
      },
      ...input,
    });
  }

  @UseGuards(PlatformUserPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Invite'),
  )
  @Mutation((_) => Invite)
  async inviteAccept(
    @Args('input') input: AcceptInviteInput,
    @CurrentUser() user: User,
  ) {
    const invite = await this.invitesService.acceptInvite({
      ...input,
      updatedBy: {
        user: user.id,
      },
    });
    await this.membersService.create({
      organizationId: invite.organizationId,
      userId: user.id,
      role: invite.role,
      createdBy: {
        user: user.id,
      },
    });

    return invite;
  }
}
