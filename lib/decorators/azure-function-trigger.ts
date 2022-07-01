import { TRIGGER_DECORATOR_KEY } from './prefix';
import { createMethodDecorator } from './creaters';

export function AzureFunctionTrigger(functionName: string): MethodDecorator {
  return createMethodDecorator(TRIGGER_DECORATOR_KEY, functionName);
}
