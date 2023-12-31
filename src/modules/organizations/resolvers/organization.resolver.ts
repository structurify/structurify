import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '@modules/auth/guards';
import { User, MemberRole } from '@prisma/client';

import {
  Organization,
  OrganizationsResponse,
  OrganizationsArgs,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  DeleteOrganizationInput,
} from '@contracts/organizations';
import { CurrentUser } from '@decorators/current-user.decorator';
import {
  AppAbility,
  CheckPlatformPolicies,
  PlatformUserPoliciesGuard,
  PlatformMemberPoliciesGuard,
} from '@app/modules/platform-casl';
import { OrganizationsService, MembersService } from '../services';
import { Action } from '@app/contracts/casl';

@UseGuards(JwtAuthGuard)
@Resolver((_) => Organization)
export class OrganizationResolver {
  private readonly logger = new Logger(OrganizationResolver.name);

  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly membersService: MembersService,
  ) {}

  @UseGuards(PlatformUserPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Organization'),
  )
  @Query((_) => Organization, { nullable: true })
  async organization(@Args('id') id: string) {
    return this.organizationsService.findOneById(id);
  }

  @UseGuards(PlatformUserPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Organization'),
  )
  @Query((_) => OrganizationsResponse)
  async organizations(
    @Args() input: OrganizationsArgs,
    @CurrentUser() user: User,
  ): Promise<OrganizationsResponse> {
    const { skip, take } = input;
    const [items = [], count] = await this.organizationsService.findAllByUserId(
      {
        userId: user.id,
        ...input,
      },
    );

    return {
      items,
      meta: {
        skip,
        take,
        count,
      },
    };
  }

  @UseGuards(PlatformUserPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Create, 'Organization'),
  )
  @Mutation((_) => Organization)
  async organizationCreate(
    @Args('input') input: CreateOrganizationInput,
    @CurrentUser() user: User,
  ) {
    const organization = await this.organizationsService.create({
      createdBy: {
        user: user.id,
      },
      ...input,
    });
    await this.membersService.create({
      organizationId: organization.id,
      userId: user.id,
      role: MemberRole.OWNER,
      isOwner: true,
      createdBy: {
        user: user.id,
      },
    });

    return organization;
  }

  @UseGuards(PlatformMemberPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, 'Organization'),
  )
  @Mutation((_) => Organization)
  async organizationDelete(
    @Args('input') input: DeleteOrganizationInput,
    @CurrentUser() user: User,
  ) {
    const organization = await this.organizationsService.findOneById(input.id);

    if (!organization) {
      throw new NotFoundException(input.id);
    }

    await this.organizationsService.delete({
      deletedBy: {
        user: user.id,
      },
      ...input,
    });

    return organization;
  }

  @UseGuards(PlatformMemberPoliciesGuard)
  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'Organization'),
  )
  @Mutation((_) => Organization)
  async organizationUpdate(
    @Args('input') input: UpdateOrganizationInput,
    @CurrentUser() user: User,
  ) {
    let organization = await this.organizationsService.findOneById(input.id);

    if (!organization) {
      throw new NotFoundException(input.id);
    }

    organization = await this.organizationsService.update({
      updatedBy: {
        user: user.id,
      },
      ...input,
    });

    return organization;
  }
}
