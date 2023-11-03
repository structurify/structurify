import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
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
  ApiKey,
  Project,
  ApiKeysResponse,
  ApiKeysArgs,
  CreateApiKeyInput,
  UpdateApiKeyInput,
  DeleteApiKeyInput,
} from '@contracts/projects';
import { Action } from '@contracts/casl';
import { CurrentUser } from '@decorators/current-user.decorator';
import {
  AppAbility,
  CheckPlatformPolicies,
  PlatformMemberPoliciesGuard,
} from '@modules/platform-casl';

import { ApiKeysService, ProjectsService } from '../services';

@UseGuards(JwtAuthGuard, PlatformMemberPoliciesGuard)
@Resolver((_) => ApiKey)
export class ApiKeyResolver {
  private readonly logger = new Logger(ApiKeyResolver.name);

  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly projectsService: ProjectsService,
  ) {}

  @ResolveField((_) => Project)
  async project(@Parent() root: ApiKey) {
    return this.projectsService.findOneById(root.projectId);
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'ApiKey'),
  )
  @Query((_) => ApiKey, { nullable: true })
  async apiKey(@Args('id') id: string) {
    return this.apiKeysService.findOneById(id);
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'ApiKey'),
  )
  @Query((_) => ApiKeysResponse)
  async apiKeys(@Args() input: ApiKeysArgs): Promise<ApiKeysResponse> {
    const { skip, take } = input;
    const [items = [], count] = await this.apiKeysService.findAll(input);

    return {
      items,
      meta: {
        skip,
        take,
        count,
      },
    };
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Create, 'ApiKey'),
  )
  @Mutation((_) => ApiKey)
  async apiKeyCreate(
    @Args('input') input: CreateApiKeyInput,
    @CurrentUser() user: User,
  ) {
    const apiKey = await this.apiKeysService.create({
      createdBy: {
        user: user.id,
      },
      ...input,
    });

    return apiKey;
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, 'ApiKey'),
  )
  @Mutation((_) => ApiKey)
  async apiKeyDelete(
    @Args('input') input: DeleteApiKeyInput,
    @CurrentUser() user: User,
  ) {
    const apiKey = await this.apiKeysService.findOneById(input.id);

    if (!apiKey) {
      throw new NotFoundException(input.id);
    }

    await this.apiKeysService.delete({
      deletedBy: {
        user: user.id,
      },
      ...input,
    });

    return apiKey;
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'ApiKey'),
  )
  @Mutation((_) => ApiKey)
  async apiKeyUpdate(
    @Args('input') input: UpdateApiKeyInput,
    @CurrentUser() user: User,
  ) {
    let apiKey = await this.apiKeysService.findOneById(input.id);

    if (!apiKey) {
      throw new NotFoundException(input.id);
    }

    apiKey = await this.apiKeysService.update({
      updatedBy: {
        user: user.id,
      },
      ...input,
    });

    return apiKey;
  }
}
