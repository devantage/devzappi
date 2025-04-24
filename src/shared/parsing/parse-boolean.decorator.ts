import { Transform, TransformFnParams } from 'class-transformer';

export const ParseBoolean: () => PropertyDecorator = () =>
  Transform((params: TransformFnParams): boolean | undefined => {
    if (!params.value) {
      return false;
    }

    if (typeof params.value === 'boolean') {
      return params.value;
    }

    if (typeof params.value === 'string') {
      return params.value.toLowerCase() === 'true';
    }
  });
