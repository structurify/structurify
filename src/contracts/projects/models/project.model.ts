import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ProjectStatus } from '@prisma/client';

import { BaseModel } from '@contracts/common/models';

@ObjectType({ description: 'Project' })
export class Project extends BaseModel {
  @Field((_) => String)
  public organizationId: string;

  @Field((_) => String)
  public name: string;

  @Field((_) => ProjectStatus)
  public status: ProjectStatus;
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
});
