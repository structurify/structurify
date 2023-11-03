import { PureAbility, AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';

import { Injectable } from '@nestjs/common';
import {
  User,
  Invite,
  Project,
  Organization,
  Member,
  MemberRole,
  ApiKey,
} from '@prisma/client';
import { Action } from '@contracts/casl';

type AppSubjects =
  | 'all'
  | Subjects<{
      User: User;
      Invite: Invite;
      Project: Project;
      Organization: Organization;
      Member: Member;
      ApiKey: ApiKey;
    }>;

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class PlatformCaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    can(Action.Manage, 'User', { id: user.id });
    can(Action.Create, 'Organization');
    can(Action.Read, 'Organization');
    can(Action.Read, 'Invite');

    return build({
      detectSubjectType: (item) =>
        item.constructor as AppSubjects extends string ? AppSubjects : never,
    });
  }

  createForMember(member: Member) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    if (member.role === MemberRole.OWNER) {
      can(Action.Manage, 'User', { id: member.userId });
      can(Action.Manage, 'Organization', { id: member.organizationId });
      can(Action.Manage, 'Project', { organizationId: member.organizationId });
      can(Action.Manage, 'Invite', { organizationId: member.organizationId });
      can(Action.Manage, 'Member', { organizationId: member.organizationId });
      can(Action.Manage, 'ApiKey', {
        project: {
          organizationId: member.organizationId,
        },
      });
    }

    if (member.role === MemberRole.ADMINISTRATOR) {
      can(Action.Manage, 'User', { id: member.userId });
      can(Action.Manage, 'Organization', { id: member.organizationId });
      can(Action.Manage, 'Project', { organizationId: member.organizationId });
      can(Action.Manage, 'Invite', { organizationId: member.organizationId });
      can(Action.Manage, 'Member', { organizationId: member.organizationId });
      can(Action.Manage, 'ApiKey', {
        project: {
          organizationId: member.organizationId,
        },
      });

      cannot(Action.Delete, 'Member', {
        organizationId: member.organizationId,
        role: MemberRole.OWNER,
      });
      cannot(Action.Update, 'Member', {
        organizationId: member.organizationId,
        role: MemberRole.OWNER,
      });
      cannot(Action.Create, 'Member', {
        organizationId: member.organizationId,
        role: MemberRole.OWNER,
      });
    }

    if (member.role === MemberRole.DEVELOPER) {
      can(Action.Manage, 'User', { id: member.userId });
      can(Action.Read, 'Organization', { id: member.organizationId });
      can(Action.Read, 'Project', { organizationId: member.organizationId });
      can(Action.Read, 'Member', { organizationId: member.organizationId });
      can(Action.Read, 'Invite', { organizationId: member.organizationId });
      can(Action.Read, 'ApiKey', {
        project: {
          organizationId: member.organizationId,
        },
      });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as AppSubjects extends string ? AppSubjects : never,
    });
  }
}
