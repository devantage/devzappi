import { BadRequestException, ValidationError } from '@nestjs/common';

type ValidationErrors = { [key: string]: string | ValidationErrors }[];

const formatErrors = (errors: ValidationError[]): ValidationErrors => {
  return errors.map((curError: ValidationError) => {
    const errorTree: { [key: string]: string | ValidationErrors } = {};

    if (curError.constraints) {
      errorTree[curError.property] = Object.values(curError.constraints)[0];
    }

    if (curError.children && curError.children.length > 0) {
      errorTree[curError.property] = formatErrors(curError.children);
    }

    return errorTree;
  });
};

export const validationExceptionFactory = (
  errors: ValidationError[],
): BadRequestException => {
  return new BadRequestException(formatErrors(errors));
};
