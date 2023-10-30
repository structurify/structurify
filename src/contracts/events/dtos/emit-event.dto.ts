import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
  IsEnum,
} from 'class-validator';
import type { Prisma } from '@prisma/client';

import type { PrismaModels } from '@contracts/common'

import { EventAction } from '../enums';
import type { EventNames } from '../enums';


export class EmitEventDto<T = PrismaModels> {
  @IsObject()
  @IsNotEmpty()
  public event: any;

  @IsString()
  @IsNotEmpty()
  public eventName: EventNames;

  @IsString()
  @IsNotEmpty()
  public entity: Prisma.ModelName;

  @IsString()
  @IsNotEmpty()
  public entityId: string;

  @IsEnum(EventAction)
  @IsNotEmpty()
  public action: EventAction;

  @IsObject()
  @IsOptional()
  public before?: T;

  @IsObject()
  @IsOptional()
  public after?: T;
}
