import {
  Logger,
  NotFoundException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
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
  Project,
  Organization,
  ProjectsResponse,
  ProjectsArgs,
  CreateProjectInput,
  UpdateProjectInput,
  DeleteProjectInput,
  TransferProjectInput,
} from '@contracts/organizations';
import { CurrentUser } from '@decorators/current-user.decorator';
import { Action } from '@contracts/casl';
import {
  AppAbility,
  CheckPlatformPolicies,
  PlatformMemberPoliciesGuard,
} from '@modules/platform-casl';

import {
  ProjectsService,
  OrganizationsService,
  MembersService,
} from '../services';

@UseGuards(JwtAuthGuard, PlatformMemberPoliciesGuard)
@Resolver((_) => Project)
export class ProjectResolver {
  private readonly logger = new Logger(ProjectResolver.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly membersService: MembersService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @ResolveField((_) => Organization)
  async organization(@Parent() root: Project) {
    return this.organizationsService.findOneById(root.organizationId);
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Project'),
  )
  @Query((_) => Project, { nullable: true })
  async project(@Args('id') id: string) {
    return this.projectsService.findOneById(id);
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Project'),
  )
  @Query((_) => ProjectsResponse)
  async projects(@Args() input: ProjectsArgs): Promise<ProjectsResponse> {
    const { skip, take } = input;
    const [items = [], count] = await this.projectsService.findAll(input);

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
    ability.can(Action.Create, 'Project'),
  )
  @Mutation((_) => Project)
  async projectCreate(
    @Args('input') input: CreateProjectInput,
    @CurrentUser() user: User,
  ) {
    const project = await this.projectsService.create({
      createdBy: {
        user: user.id,
      },
      ...input,
    });

    return project;
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, 'Project'),
  )
  @Mutation((_) => Project)
  async projectDelete(
    @Args('input') input: DeleteProjectInput,
    @CurrentUser() user: User,
  ) {
    const project = await this.projectsService.findOneById(input.id);

    if (!project) {
      throw new NotFoundException(input.id);
    }

    await this.projectsService.delete({
      deletedBy: {
        user: user.id,
      },
      ...input,
    });

    return project;
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'Project'),
  )
  @Mutation((_) => Project)
  async projectUpdate(
    @Args('input') input: UpdateProjectInput,
    @CurrentUser() user: User,
  ) {
    let project = await this.projectsService.findOneById(input.id);

    if (!project) {
      throw new NotFoundException(input.id);
    }

    project = await this.projectsService.update({
      updatedBy: {
        user: user.id,
      },
      ...input,
    });

    return project;
  }

  @CheckPlatformPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'Project'),
  )
  @Mutation((_) => Project)
  async projectTransfer(
    @Args('input') { id, newOrganizationId }: TransferProjectInput,
    @CurrentUser() user: User,
  ) {
    let project = await this.projectsService.findOneById(id);

    if (!project) {
      throw new NotFoundException(id);
    }

    const member = await this.membersService.findOne(
      newOrganizationId,
      user.id,
    );
    if (!member) {
      throw new BadRequestException(
        `Not member of new organization - ${newOrganizationId}`,
      );
    }

    project = await this.projectsService.update({
      id,
      organizationId: newOrganizationId,
      updatedBy: {
        user: user.id,
      },
    });

    return project;
  }
}
