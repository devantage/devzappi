import { EnvConfig } from '../interfaces';

type ValidationOptions =
  | {
      required: boolean;
      type: 'string' | 'number';
      values?: never;
    }
  | {
      required: boolean;
      type: 'literal';
      values: string[];
    };

const validationSchema: Record<keyof EnvConfig, ValidationOptions> = {
  TZ: { required: true, type: 'string' },
  APP_ENV: {
    required: true,
    type: 'literal',
    values: ['development', 'staging', 'production'],
  },
  APP_PORT: { required: true, type: 'number' },
  APP_GLOBAL_PREFIX: { required: false, type: 'string' },

  APP_LOG_LEVEL: {
    required: true,
    type: 'literal',
    values: ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'],
  },
  APP_AUTH_KEY: { required: true, type: 'string' },

  REDIS_REPOSITORY_HOST: { required: true, type: 'string' },
  REDIS_REPOSITORY_PORT: { required: true, type: 'number' },
  REDIS_REPOSITORY_PASSWORD: { required: true, type: 'string' },
  REDIS_REPOSITORY_DATABASE: { required: true, type: 'number' },

  REDIS_SESSIONS_HOST: { required: true, type: 'string' },
  REDIS_SESSIONS_PORT: { required: true, type: 'number' },
  REDIS_SESSIONS_PASSWORD: { required: true, type: 'string' },
  REDIS_SESSIONS_DATABASE: { required: true, type: 'number' },
};

function validateString(
  name: string,
  value: string | undefined,
  options: ValidationOptions,
): string | null {
  if (options.required && !value) {
    return `- ${name} is required`;
  }

  if (!options.required && !value) {
    return null;
  }

  if (!value?.length) {
    return `- ${name} must be a string`;
  }

  return null;
}

function validateNumber(
  name: string,
  value: string | undefined,
  options: ValidationOptions,
): string | null {
  if (options.required && !value) {
    return `- ${name} is required`;
  }

  if (!options.required && !value) {
    return null;
  }

  const parsedValue: number = Number(value);

  if (isNaN(parsedValue)) {
    return `- ${name} must be a number`;
  }

  return null;
}

function validateLiteral(
  name: string,
  value: string | undefined,
  options: ValidationOptions,
): string | null {
  if (options.required && !value) {
    return `- ${name} is required`;
  }

  if (!options.required && !value) {
    return null;
  }

  if (!options.values) {
    throw new Error(`You must provide values list for type literal`);
  }

  if (value && !options.values.includes(value)) {
    return `- ${name} must be one of these values [${options.values.join(', ')}]`;
  }

  return null;
}

export function validateEnvConfig(): void {
  let validationErrors: (string | null)[] = [];

  for (const curEnvConfigName of Object.keys(validationSchema)) {
    const curEnvConfigOptions: ValidationOptions =
      validationSchema[curEnvConfigName as keyof EnvConfig];

    const curEnvConfigValue: string | undefined = process.env[curEnvConfigName];

    switch (curEnvConfigOptions.type) {
      case 'string':
        validationErrors.push(
          validateString(
            curEnvConfigName,
            curEnvConfigValue,
            curEnvConfigOptions,
          ),
        );
        break;
      case 'number':
        validationErrors.push(
          validateNumber(
            curEnvConfigName,
            curEnvConfigValue,
            curEnvConfigOptions,
          ),
        );
        break;
      case 'literal':
        validationErrors.push(
          validateLiteral(
            curEnvConfigName,
            curEnvConfigValue,
            curEnvConfigOptions,
          ),
        );
        break;
    }
  }

  validationErrors = validationErrors.filter(
    (curValidationError: string | null) => !!curValidationError,
  );

  if (validationErrors.length) {
    throw new Error(
      `Invalid environment configuration:\n\n${validationErrors.join('\n')}`,
    );
  }
}
