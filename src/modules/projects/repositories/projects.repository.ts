import { Injectable, Logger } from '@nestjs/common';
import { Project, ProjectStatus } from '@prisma/client';

import { PrismaService } from '@providers/db/prisma';
import {
  CreateProjectDto,
  DeleteProjectDto,
  UpdateProjectDto,
  ProjectsArgs,
} from '@contracts/projects';

@Injectable()
export class ProjectsRepository {
  private readonly logger = new Logger(ProjectsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.project.create({
      data: {
        ...input,
        status: ProjectStatus.ACTIVE,
        updatedBy: input.createdBy,
      },
    });
  }

  async update(input: UpdateProjectDto): Promise<Project> {
    const { id, ...rest } = input;

    return this.prisma.project.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...rest,
      },
    });
  }

  async delete(input: DeleteProjectDto): Promise<Project> {
    const { id, deletedBy } = input;

    return this.prisma.project.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }
}
