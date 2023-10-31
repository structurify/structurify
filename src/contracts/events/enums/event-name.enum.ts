import { UserEvents } from '@contracts/users';
import { OrganizationEvents } from '@contracts/organizations';
import { ProjectEvents } from '@contracts/projects';
import { AuthEvents } from '@contracts/auth';

export type EventNames =
  | AuthEvents
  | OrganizationEvents
  | UserEvents
  | ProjectEvents;
