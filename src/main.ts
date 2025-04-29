import { Logger, LogLevel, VersioningType } from '@nestjs/common';
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

function validateEnvConfigs(): void {
  try {
    console.log(`Validating application environment configuration...`);

    validateEnvConfig();

    console.log(`Application environment configuration successfully validated`);
  } catch (error) {
    console.error(
      `Invalid application environment configuration: ${getErrorMessage(error)}`,
    );

    process.exit(2);
  }
}

function getEnabledLogLevels(): LogLevel[] {
  console.log(`Getting application enabled log levels...`);

  const enabledLogLevels: LogLevel[] = getLogLevels(process.env.APP_LOG_LEVEL);

  console.log(
    `Application enabled log levels successfully got. Enabled levels: [${enabledLogLevels.join(', ')}]`,
  );

  return enabledLogLevels;
}

function configureQueryParser(app: NestExpressApplication): void {
  logger.log(`Configuring application query parser...`);

  app.set('query parser', 'extended');

  logger.log(`Application query parser successfully configured`);
}

function configureVersioning(
  app: NestExpressApplication,
): NestExpressApplication {
  logger.log(`Configuring application versioning...`);

  const defaultVersion: string = '1';

  const configuredApp: NestExpressApplication = app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [defaultVersion],
  });

  logger.log(
    `Application versioning successfully configured. Default version: ${defaultVersion}`,
  );

  return configuredApp;
}

function configureGlobalPrefix(
  app: NestExpressApplication,
): NestExpressApplication {
  logger.log(`Configuring application global prefix...`);

  let configuredApp: NestExpressApplication = app;

  const globalPrefix: string | undefined = process.env.APP_GLOBAL_PREFIX;

  if (globalPrefix) {
    configuredApp = app.setGlobalPrefix(globalPrefix);
  } else {
    logger.log(`No global prefix is set. Ignoring...`);
  }

  logger.log(
    `Application global prefix successfully configured. Global prefix: ${globalPrefix || 'none'}`,
  );

  return configuredApp;
}

function configureCors(app: NestExpressApplication): void {
  logger.log('Configuring application CORS...');

  app.enableCors();

  logger.log('Application CORS successfully configured');
}

function initializeSwaggerUi(app: NestExpressApplication): string {
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

  return path;
}

async function initialize(app: NestExpressApplication): Promise<string> {
  logger.log(`Initializing application...`);

  await app.listen(Number(process.env.APP_PORT));

  const appUrl: string = await app.getUrl();

  logger.log(`Application successfully initialized`);

  return appUrl;
}

async function bootstrap(): Promise<void> {
  validateEnvConfigs();

  const appLogLevels: LogLevel[] = getEnabledLogLevels();

  let app: NestExpressApplication = await NestFactory.create(AppModule, {
    logger: appLogLevels,
  });

  configureQueryParser(app);

  app = configureVersioning(app);

  app = configureGlobalPrefix(app);

  configureCors(app);

  const docsPath: string = initializeSwaggerUi(app);

  const appUrl: string = await initialize(app);

  logger.log(
    `Application is listening at ${appUrl} and documentation is available at ${appUrl}/${docsPath}`,
  );
}

void bootstrap();
