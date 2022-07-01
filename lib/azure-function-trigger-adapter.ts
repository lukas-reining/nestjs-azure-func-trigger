import { Context } from '@azure/functions';
import { INestApplication } from '@nestjs/common';
import { AzureFunctionExplorer } from './azure-function-explorer';

let handler: Function;

export function createHandlerAdapter(app: INestApplication) {
  return async (context: Context) => {
    await AzureFunctionExplorer.dispatchFunctionTrigger(app, context);
  };
}

export class AzureFunctionTriggerAdapterStatic {
  handle<Service, ServiceMethod extends keyof Service>(
    createApp: () => Promise<INestApplication>,
    context: Context,
  ) {
    if (handler) {
      return handler(context);
    }
    return this.createHandler(createApp).then((fn) => fn(context));
  }

  private async createHandler<Service, ServiceMethod extends keyof Service>(
    createApp: () => Promise<INestApplication>,
  ) {
    const app = await createApp();
    handler = createHandlerAdapter(app);
    return handler;
  }
}

export const AzureFunctionTriggerAdapter =
  new AzureFunctionTriggerAdapterStatic();
