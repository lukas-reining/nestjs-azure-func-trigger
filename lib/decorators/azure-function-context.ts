import { createParameterInjectionDecorator } from './creaters';
import { CONTEXT_DECORATOR_KEY } from './prefix';

export function AzureFunctionContext() {
  return createParameterInjectionDecorator(CONTEXT_DECORATOR_KEY, true);
}
