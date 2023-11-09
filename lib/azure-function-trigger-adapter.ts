import { INestApplication } from '@nestjs/common';
import { AzureFunctionExplorer } from './azure-function-explorer';
import { TriggerContext } from './context';

let handler: Function;

export function createHandlerAdapter<T>(app: INestApplication) {
  return async (context: TriggerContext<T>) => {
    await AzureFunctionExplorer.dispatchFunctionTrigger<T>(app, context);
  };
}

export class AzureFunctionTriggerAdapterStatic {
  handle<Service, ServiceMethod extends keyof Service, C>(
    createApp: () => Promise<INestApplication>,
    context: TriggerContext<C>
  ) {
    if (handler) {
      return handler(context);
    }
    return this.createHandler<Service, ServiceMethod, C>(createApp).then((fn) =>
      fn(context)
    );
  }

  private async createHandler<Service, ServiceMethod extends keyof Service, C>(
    createApp: () => Promise<INestApplication>
  ) {
    const app = await createApp();
    handler = createHandlerAdapter(app);
    return handler;
  }
}

export const AzureFunctionTriggerAdapter =
  new AzureFunctionTriggerAdapterStatic();
