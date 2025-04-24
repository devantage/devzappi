import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNotBlank(
  validationOptions?: ValidationOptions,
): (obj: object, propertyName: string) => void {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        defaultMessage(): string {
          return `${propertyName} cannot be blank`;
        },
      },
    });
  };
}
