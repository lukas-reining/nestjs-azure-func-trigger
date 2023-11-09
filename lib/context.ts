import type { Context } from '@azure/functionsV3';
import type { InvocationContext } from '@azure/functionsV4';

export type AzureFunctionV3Context<T> = T &
  Pick<Context, 'log'> & { executionContext: { functionName: string } };
export type AzureFunctionV4Context<T> = T &
  Pick<InvocationContext, 'log' | 'functionName'>;
export type TriggerContext<T> =
  | AzureFunctionV3Context<T>
  | AzureFunctionV4Context<T>;
