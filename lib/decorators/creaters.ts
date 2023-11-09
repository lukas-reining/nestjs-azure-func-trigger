export function createMethodDecorator<T = any>(
  metakey: string,
  metadata: T
): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(metakey, metadata, descriptor.value);
    return descriptor;
  };
}

export function createParameterInjectionDecorator<T = any>(
  metakey: string,
  metadata: T
): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const injections =
      Reflect.getOwnMetadata(metakey, target, propertyKey) ?? {};

    const paramDecorations = {
      ...injections,
      [parameterIndex]: metadata
    };

    Reflect.defineMetadata(metakey, paramDecorations, target, propertyKey);
  };
}
