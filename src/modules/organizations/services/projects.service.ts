import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Project, ProjectStatus } from '@prisma/client';

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
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async findOneById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
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
