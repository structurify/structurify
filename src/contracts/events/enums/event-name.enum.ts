import { UserEvents } from '@contracts/users';
import { OrganizationEvents } from '@contracts/organizations';
import { AuthEvents } from '@contracts/auth';

export type EventNames = UserEvents | OrganizationEvents | AuthEvents;
