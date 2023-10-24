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

import { OrganizationsService, MembersService } from '../services';
import { UsersService } from '@modules/users/services';

import {
  Member,
  Organization,
  MembersResponse,
  MembersArgs,
  GetMemberInput,
  UpdateMemberInput,
  DeleteMemberInput,
} from '@contracts/organizations';
import { User as UserContract } from '@contracts/users';
import { CurrentUser } from '@decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Resolver((_) => Member)
export class MemberResolver {
  private readonly logger = new Logger(MemberResolver.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField((_) => Organization)
  async organization(@Parent() root: Member) {
    return this.organizationsService.findOneById(root.organizationId);
  }

  @ResolveField((_) => UserContract)
  async user(@Parent() root: Member) {
    return this.usersService.findOneById(root.organizationId);
  }

  @Query((_) => Member, { nullable: true })
  async member(@Args('input') input: GetMemberInput) {
    return this.membersService.findOne(input.organizationId, input.userId);
  }

  @Query((_) => MembersResponse)
  async members(@Args() input: MembersArgs): Promise<MembersResponse> {
    const { skip, take } = input;
    const [items = [], count] = await this.membersService.findAll(input);

    return {
      items,
      meta: {
        skip,
        take,
        count,
      },
    };
  }

  @Mutation((_) => Member)
  async memberDelete(
    @Args('input') input: DeleteMemberInput,
    @CurrentUser() user: User,
  ) {
    return this.membersService.delete({
      deletedBy: {
        user: user.id,
      },
      ...input,
    });
  }

  @Mutation((_) => Member)
  async memberUpdate(
    @Args('input') input: UpdateMemberInput,
    @CurrentUser() user: User,
  ) {
    return this.membersService.update({
      updatedBy: {
        user: user.id,
      },
      ...input,
    });
  }
}
