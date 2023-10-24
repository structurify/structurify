import {
  Module,
  Logger,
  Type,
  ForwardReference,
  DynamicModule,
} from '@nestjs/common';

// Modules
import { AuthModule } from '@modules/auth/auth.module';
import { EventsModule } from '@modules/events/events.module';
import { HealthModule } from '@modules/health/health.module';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { CommunicationModule } from '@modules/communication/communication.module';
import { CoreModule } from '@modules/core/core.module';
import { DataLakeModule } from '@modules/data-lake/data-lake.module';
import { SearchModule } from '@modules/search/search.module';

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
