import { Type } from '@nestjs/common';
import { ObjectType, Field } from '@nestjs/graphql';

import { PageMeta } from '@contracts/common/models';

const typeMap = {};
export function pagination<T = any>(type: Type<T>): any {
  const { name } = type;
  if (typeMap[`${name}`]) return typeMap[`${name}`];

  @ObjectType(`${name}Page`, { isAbstract: true })
  abstract class Page {
    public name = `${name}Page`;

    @Field(() => [type], { nullable: true })
    public items!: T[];

    @Field(() => PageMeta, { nullable: true })
    public meta!: PageMeta;
  }

  typeMap[`${name}`] = Page;
  return typeMap[`${name}`];
}
