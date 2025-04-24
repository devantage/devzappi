import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import { description, version } from '../package.json';
import { AppModule } from './app.module';
import { validateEnvConfig } from './shared/config';
import { getLogLevels } from './shared/logging';
import { getErrorMessage } from './shared/utils';

const logger: Logger = new Logger('NestApplication');

function validateEnvironments(): void {
  validateEnvConfig();
}

function configureQueryParser(app: NestExpressApplication): void {
  app.set('query parser', 'extended');
}

function configureLogger(app: NestExpressApplication): void {
  app.useLogger(getLogLevels(process.env.APP_LOG_LEVEL));
}

function configureVersioning(
  app: NestExpressApplication,
): NestExpressApplication {
  return app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });
}

function configureGlobalPrefix(
  app: NestExpressApplication,
): NestExpressApplication {
  if (process.env.APP_GLOBAL_PREFIX) {
    return app.setGlobalPrefix(process.env.APP_GLOBAL_PREFIX);
  } else {
    return app;
  }
}

function initializeSwaggerUi(app: NestExpressApplication): void {
  logger.log('Initializing Swagger UI...');

  let documentBuilder: DocumentBuilder = new DocumentBuilder();

  documentBuilder = documentBuilder.setTitle(`${String(description)} | Docs`);

  documentBuilder = documentBuilder.setVersion(String(version));

  documentBuilder = documentBuilder.addApiKey(
    {
      type: 'apiKey',
      name: 'api-key',
      in: 'header',
    },
    'apiKey',
  );

  const config: Omit<OpenAPIObject, 'paths'> = documentBuilder.build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  const options: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization:
        process.env.APP_ENV === 'development' ? true : false,
    },
    customSiteTitle: `${String(description)} | Docs`,
    customfavIcon: '../assets/favicon.ico',
    customCss: `
      .topbar-wrapper img {
        content: url('../assets/logo.png');
        width: 64px;
        height: auto;
      }

      .swagger-ui .topbar {
        background-color: white;
      }
    `,
  };

  let path: string = 'docs';

  if (process.env.APP_GLOBAL_PREFIX) {
    path = process.env.APP_GLOBAL_PREFIX + '/' + path;
  }

  SwaggerModule.setup(path, app, document, options);

  logger.log('Swagger UI successfully initialized');
}

function configureCors(app: NestExpressApplication): void {
  logger.log('Configuring Nest application CORS...');

  app.enableCors();

  logger.log('Nest application CORS successfully configured');
}

async function bootstrap(): Promise<void> {
  let app: NestExpressApplication = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  try {
    validateEnvironments();
  } catch (error) {
    console.error(getErrorMessage(error));

    process.exit(2);
  }

  configureQueryParser(app);

  configureLogger(app);

  app = configureVersioning(app);

  app = configureGlobalPrefix(app);

  initializeSwaggerUi(app);

  configureCors(app);

  await app.listen(Number(process.env.APP_PORT));

  logger.log(`Nest application is running on: ${await app.getUrl()}`);
}

void bootstrap();
