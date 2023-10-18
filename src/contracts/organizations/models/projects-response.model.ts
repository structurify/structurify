import { ObjectType } from '@nestjs/graphql';
import { pagination } from '@shared/objects/pagination.object';

import { Project } from './project.model';

@ObjectType({ description: 'Projects' })
export class ProjectsResponse extends pagination<Project>(Project) {}
