import { otelSDK } from './tracing';

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from '../app.module';

import { setupSecurity } from './security';
import { setupGeneric } from './generic';

export async function bootstrap() {
  otelSDK.start();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.flushLogs();

  const server = app.getHttpServer();
  Logger.verbose(`Server timeout: ${server.timeout}`);
  server.keepAliveTimeout = 61 * 1000;
  Logger.verbose(
    `Server keepAliveTimeout: ${server.keepAliveTimeout / 1000}s `,
  );
  server.headersTimeout = 65 * 1000;
  Logger.verbose(`Server headersTimeout: ${server.headersTimeout / 1000}s `);

  setupSecurity(app);
  setupGeneric(app);

  Logger.log('BOOTSTRAPPED SUCCESSFULLY');

  await app.listen(process.env.PORT as string);

  app.enableShutdownHooks();

  Logger.log(
    `Started application in NODE_ENV=${process.env.NODE_ENV} on port ${process.env.PORT}`,
  );

  return app;
}
