import {
  Module,
  Logger,
  Type,
  ForwardReference,
  DynamicModule,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import { join } from 'path';

// Providers
import { PrismaModule } from '@providers/db/prisma/prisma.module';

// Modules
import { AuthModule } from '@modules/auth/auth.module';
import { EventsModule } from '@modules/events/events.module';
import { HealthModule } from '@modules/health/health.module';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { CommunicationModule } from '@modules/communication/communication.module';

const modules: Array<
  Type | DynamicModule | Promise<DynamicModule> | ForwardReference
> = [
  PrismaModule,
  EventEmitterModule.forRoot({
    global: true,
  }),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    playground: true,
    autoSchemaFile: 'schema.gql',
    sortSchema: true,
    context: ({ req }) => ({ req }),
  }),
  CacheModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      ttl: Number(configService.get('CACHE_TTL')),
      isGlobal: true,
    }),
    inject: [ConfigService],
  }),
  I18nModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      fallbackLanguage: configService.getOrThrow('I18N_FALLBACK_LANGUAGE'),
      loaderOptions: {
        path: join(__dirname, '/src/i18n/'),
        watch: true,
      },
    }),
    resolvers: [
      { use: QueryResolver, options: ['lang'] },
      AcceptLanguageResolver,
      new HeaderResolver(['x-lang']),
    ],
    inject: [ConfigService],
  }),

  ScheduleModule.forRoot(),
  HealthModule,
  AuthModule,
  UsersModule,
  OrganizationsModule,
  EventsModule,
  CommunicationModule,
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
