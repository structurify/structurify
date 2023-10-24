import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

@Global()
@Module({
  imports: [
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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: Number(configService.get('REDIS_DEFAULT_TTL')),
        isGlobal: true,
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: Number(configService.get('REDIS_PORT')),
        auth_pass: configService.get('REDIS_PASSWORD'),
        no_ready_check: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [CacheModule],
})
export class CoreModule {}
