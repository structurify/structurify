import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Project } from '@prisma/client';

import { EventsService } from '@modules/events/services';
import {
  CreateProjectDto,
  DeleteProjectDto,
  UpdateProjectDto,
  ProjectsArgs,
  ProjectEvents,
  ProjectCreatedEvent,
  ProjectDeletedEvent,
  ProjectUpdatedEvent,
} from '@contracts/projects';
import { EventAction } from '@app/contracts/events';

import { ProjectsRepository } from '../repositories';
import { ProjectsCache } from '../caches';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  static entityId(entry: Project): string {
    return `Organization-${entry.organizationId}/Project-${entry.id}`;
  }

  constructor(
    private readonly eventsService: EventsService,
    private readonly projectsCache: ProjectsCache,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async findOneById(id: string): Promise<Project | null> {
    const cachedData = await this.projectsCache.findOneById(id);
    if (cachedData) {
      return cachedData;
    }

    const project = await this.projectsRepository.findOneById(id);
    if (!!project) {
      await this.projectsCache.set(project);
    }

    return project;
  }

  async findAll(args: ProjectsArgs): Promise<[Project[], number]> {
    return this.projectsRepository.findAll(args);
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = await this.projectsRepository.create(dto);

    await this.projectsCache.set(project);

    this.eventsService.emitEvent({
      entity: 'Project',
      entityId: ProjectsService.entityId(project),
      eventName: ProjectEvents.PROJECT_CREATED,
      event: new ProjectCreatedEvent(),
      action: EventAction.CREATE,
      after: project,
    });

    return project;
  }

  async update(dto: UpdateProjectDto): Promise<Project> {
    const { id } = dto;

    const project = await this.findOneById(id);
    if (!project) {
      throw new NotFoundException(id);
    }

    const updatedProject = await this.projectsRepository.update(dto);

    await this.projectsCache.set(updatedProject);

    this.eventsService.emitEvent({
      entity: 'Project',
      entityId: ProjectsService.entityId(project),
      eventName: ProjectEvents.PROJECT_UPDATED,
      event: new ProjectUpdatedEvent(),
      action: EventAction.UPDATE,
      before: project,
      after: updatedProject,
    });

    return updatedProject;
  }

  async delete(dto: DeleteProjectDto): Promise<Project> {
    const { id } = dto;

    const project = await this.findOneById(id);
    if (!project) {
      throw new NotFoundException(id);
    }

    const updatedProject = await this.projectsRepository.delete(dto);

    await this.projectsCache.delete(updatedProject.id);

    this.eventsService.emitEvent({
      entity: 'Project',
      entityId: ProjectsService.entityId(project),
      eventName: ProjectEvents.PROJECT_DELETED,
      event: new ProjectDeletedEvent(),
      action: EventAction.DELETE,
      before: project,
      after: updatedProject,
    });

    return updatedProject;
  }
}
