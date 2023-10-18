import { PaginationArgs } from '@contracts/common';
import { ArgsType } from '@nestjs/graphql';

@ArgsType()
export class OrganizationsArgs extends PaginationArgs {}
