import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { Project, ProjectStatus } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { PrismaService } from '@providers/db/prisma/services/prisma.service';
import { EventsService } from '@modules/events/services';
import {
  CreateProjectDto,
  DeleteProjectDto,
  UpdateProjectDto,
  ProjectsArgs,
  OrganizationEvents,
  ProjectCreatedEvent,
  ProjectDeletedEvent,
  ProjectUpdatedEvent,
} from '@contracts/organizations';
import { EventAction } from '@app/contracts/events';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async findOneById(id: string): Promise<Project | null> {
    const cachedData = await this.cacheService.get<Project>(`Project-${id}`);
    if (cachedData) {
      this.logger.debug(`Project-${id} found in cache`);
      return cachedData;
    }

    const project = await this.prisma.project.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!!project) {
      await this.cacheService.set(`Project-${id}`, project);
      this.logger.debug(`Project-${id} stored in cache`);
    }

    return project;
  }

  async findAll({
    organizationId,
    ...args
  }: ProjectsArgs): Promise<[Project[], number]> {
    return Promise.all([
      this.prisma.project.findMany({
        ...args,
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
      this.prisma.project.count({
        ...args,
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
    ]);
  }

  async create(input: CreateProjectDto): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        ...input,
        status: ProjectStatus.ACTIVE,
        updatedBy: input.createdBy,
      },
    });

    await this.cacheService.set(`Project-${project.id}`, project);
    this.logger.debug(`Project-${project.id} stored in cache`);

    this.eventsService.emitEvent({
      entity: 'Project',
      entityId: `Organization-${project.organizationId}/Project-${project.id}`,
      eventName: OrganizationEvents.PROJECT_CREATED,
      event: new ProjectCreatedEvent(),
      action: EventAction.CREATE,
      after: project,
    });

    return project;
  }

  async update(input: UpdateProjectDto): Promise<Project> {
    const { id, ...rest } = input;

    const project = await this.findOneById(id);
    if (!project) {
      throw new NotFoundException(id);
    }

    const updatedProject = await this.prisma.project.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...rest,
      },
    });

    await this.cacheService.set(`Project-${updatedProject.id}`, updatedProject);
    this.logger.debug(`Project-${updatedProject.id} updated in cache`);

    this.eventsService.emitEvent({
      entity: 'Project',
      entityId: `Organization-${project.organizationId}/Project-${project.id}`,
      eventName: OrganizationEvents.PROJECT_UPDATED,
      event: new ProjectUpdatedEvent(),
      action: EventAction.UPDATE,
      before: project,
      after: updatedProject,
    });

    return updatedProject;
  }

  async delete(input: DeleteProjectDto): Promise<Project> {
    const { id, deletedBy } = input;

    const project = await this.findOneById(id);
    if (!project) {
      throw new NotFoundException(id);
    }

    const updatedProject = await this.prisma.project.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedBy,
        deletedAt: new Date(),
      },
    });

    await this.cacheService.del(`Project-${updatedProject.id}`);
    this.logger.debug(`Project-${updatedProject.id} deleted from cache`);

    this.eventsService.emitEvent({
      entity: 'Project',
      entityId: `Organization-${project.organizationId}/Project-${project.id}`,
      eventName: OrganizationEvents.PROJECT_DELETED,
      event: new ProjectDeletedEvent(),
      action: EventAction.DELETE,
      before: project,
      after: updatedProject,
    });

    return updatedProject;
  }
}
