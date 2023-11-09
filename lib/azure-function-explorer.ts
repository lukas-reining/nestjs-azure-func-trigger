import { INestApplication, Logger } from '@nestjs/common';
import { MetadataScanner, NestContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CONTEXT_DECORATOR_KEY, TRIGGER_DECORATOR_KEY } from './decorators';
import { TriggerContext } from './context';

type ServiceWithMethod<T = object> = [object: T, methods: string[]];

export class AzureFunctionExplorer {
  private static readonly logger = new Logger(AzureFunctionExplorer.name);
  private static readonly metadataScanner = new MetadataScanner();

  private static servicesOf (app: NestContainer) {
    const modules = [...app.getModules().values()].map((module) => module);

    return modules.flatMap((module) => [
      ...module.providers.values()
    ]) as InstanceWrapper<object>[];
  }

  public static servicesWithMethods (
    services: InstanceWrapper<object>[]
  ): ServiceWithMethod[] {
    return services.map(({ instance }) => {
      if (!instance) {
        return [instance, []];
      }

      const prototype = Object.getPrototypeOf(instance);

      const methods =
        AzureFunctionExplorer.metadataScanner.getAllFilteredMethodNames(
          prototype
        );

      return [instance, [...methods]];
    });
  }

  public static servicesWithTrigger (
    servicesWithMethods: ServiceWithMethod[]
  ): ServiceWithMethod[] {
    return servicesWithMethods
      .map<ServiceWithMethod>(([instance, methods]) => [
        instance,
        methods.filter((method) => {
          return Reflect.hasMetadata(TRIGGER_DECORATOR_KEY, instance[method]);
        })
      ])
      .filter(([, methods]) => methods.length);
  }

  public static servicesWithTriggerForFunction (
    servicesWithMethods: ServiceWithMethod[],
    functionName: string
  ): ServiceWithMethod[] {
    return servicesWithMethods
      .map<ServiceWithMethod>(([instance, methods]) => [
        instance,
        methods.filter(
          (method) =>
            Reflect.getMetadata(TRIGGER_DECORATOR_KEY, instance[method]) ===
            functionName
        )
      ])
      .filter(([, methods]) => methods.length);
  }

  public static async callWithContext<T> (
    [service, method]: [Object, string],
    context: TriggerContext<T>
  ) {
    const injections: Record<string, boolean> | undefined = Reflect.getMetadata(
      CONTEXT_DECORATOR_KEY,
      service,
      method
    );

    const actualMethod = service[method];

    if (!injections) {
      return await actualMethod.apply(service, []);
    }

    const contextParameters = Object.keys(injections).map((index) =>
      parseInt(index, 10)
    );
    const args = new Array(Math.max(...contextParameters) + 1)
      .fill(undefined)
      .map((_, index) =>
        contextParameters.includes(index) ? context : undefined
      );

    return await actualMethod.apply(service, args);
  }

  public static async dispatchFunctionTrigger<T> (
    app: INestApplication,
    context: TriggerContext<T>
  ) {
    // As done in nestjs/swagger https://github.com/nestjs/swagger/blob/548e1bf1d1804241ef1a89fca09b75543a52af04/lib/swagger-scanner.ts#L41
    const container = (app as any).container as NestContainer;

    const services = AzureFunctionExplorer.servicesOf(container);
    const servicesWithMethods = this.servicesWithMethods(services);

    const servicesWithTimedTriggerMethods = this.servicesWithTriggerForFunction(
      servicesWithMethods,
      'executionContext' in context
        ? context.executionContext.functionName
        : context.functionName
    );

    const methodCalls = servicesWithTimedTriggerMethods.flatMap(
      ([service, methods]) => {
        return methods.map<[object, string]>((method) => [service, method]);
      }
    );

    await Promise.all(
      methodCalls.map(async ([service, method]) => {
        this.logger.log(`Triggering ${service.constructor.name}.${method}`);
        context.log(`Triggering ${service.constructor.name}.${method}`);

        await this.callWithContext([service, method], context);
      })
    );
  }
}
