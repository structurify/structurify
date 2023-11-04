import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ProjectCreatedEvent, ProjectEvents } from '@contracts/projects';
import { ApiKeysService } from '../services';

@Injectable()
export class ProjectsListener {
  private readonly logger = new Logger(ProjectsListener.name);

  constructor(private readonly apiKeysService: ApiKeysService) {}

  @OnEvent(ProjectEvents.PROJECT_CREATED)
  async handleProjectCreatedEvent(event: ProjectCreatedEvent) {
    await this.apiKeysService.create({
      name: 'Default',
      projectId: event.after!.id,
      createdBy: {
        service: 'projects-module',
        serviceDetails: 'Project created event',
      },
    });
    this.logger.debug(
      `Event ingestion of project ${event.after!.id} - created default api key`,
    );
  }
}
