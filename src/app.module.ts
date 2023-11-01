import {
  Module,
  Logger,
  Type,
  ForwardReference,
  DynamicModule,
} from '@nestjs/common';

// Modules
import { AuthModule } from '@modules/auth';
import { EventsModule } from '@modules/events';
import { HealthModule } from '@modules/health';
import { UsersModule } from '@modules/users';
import { OrganizationsModule } from '@modules/organizations';
import { ProjectsModule } from '@modules/projects';
import { CommunicationModule } from '@modules/communication';
import { CoreModule } from '@modules/core';
import { DataLakeModule } from '@modules/data-lake';
import { SearchModule } from '@modules/search';

const modules: Array<
  Type | DynamicModule | Promise<DynamicModule> | ForwardReference
> = [
  CoreModule,
  HealthModule,
  AuthModule,
  UsersModule,
  OrganizationsModule,
  EventsModule,
  CommunicationModule,
  DataLakeModule,
  SearchModule,
  ProjectsModule,
];

const controllers: any[] = [];

const providers: any[] = [];

@Module({
  imports: modules,
  controllers,
  providers,
})
export class AppModule {
  constructor() {
    Logger.log(`BOOTSTRAPPED NEST APPLICATION`);
  }
}
