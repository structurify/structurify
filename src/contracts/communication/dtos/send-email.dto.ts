import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
  IsEnum,
  IsEmail,
} from 'class-validator';
import type { Prisma } from '@prisma/client';

import { ServiceRoleInput } from '@contracts/common';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { EmailTemplate } from '../enums';
import { Type } from 'class-transformer';

export class SendMailDto {
  @IsEnum(EmailTemplate)
  @IsNotEmpty()
  public template: EmailTemplate;

  @IsEmail()
  @IsNotEmpty()
  public to: string;

  @IsString()
  @IsNotEmpty()
  public subject: string;

  @IsObject()
  @IsOptional()
  public context?: Record<string, any>;

  @IsObject()
  @IsOptional()
  public override?: ISendMailOptions = {};

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public sendBy: Prisma.InputJsonObject;
}
