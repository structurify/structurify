import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { MinioModule } from 'nestjs-minio-client';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { DateScalar } from '@app/shared/scalars/date.scalar';

// Providers
import { PrismaModule } from '@providers/db/prisma/';
import { MemberMiddleware } from '@app/shared/middlewares';

@Global()
@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot({
      global: true,
      wildcard: true,
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
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
        port: Number(configService.getOrThrow('MINIO_PORT')),
        useSSL: configService.getOrThrow('MINIO_SSL') === 'true',
        accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
        secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
        isGlobal: true,
      }),
    }),
    MeiliSearchModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        host: configService.getOrThrow('MEILISEARCH_HOST'),
        apiKey: configService.getOrThrow('MEILISEARCH_API_KEY'),
      }),
    }),
  ],
  providers: [DateScalar],
  exports: [
    CacheModule,
    MinioModule,
    MeiliSearchModule,
    ConfigModule,
    I18nModule,
  ],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MemberMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
