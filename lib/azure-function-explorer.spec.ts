import 'reflect-metadata';

import { AzureFunctionTrigger } from './decorators';
import { AzureFunctionExplorer } from './azure-function-explorer';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { AzureFunctionContext } from './decorators';
import { InvocationContext } from '@azure/functionsV4';

class ClassWithoutTimers {
  public noTimer() {
    console.log('Timer1');
  }
}

class ClassWith2Timers extends ClassWithoutTimers {
  public noTimer2() {
    console.log('Timer1');
  }

  @AzureFunctionTrigger('Function')
  private timer1() {
    console.log('Timer1');
  }

  @AzureFunctionTrigger('Function')
  public timer2() {
    console.log('Timer1');
  }

  @AzureFunctionTrigger('Function')
  public timerWithContext(
    test: string,
    @AzureFunctionContext() context: InvocationContext
  ) {
    console.log('TimerWithContext');
  }
}

describe('AzureFunctionExplorer', () => {
  const serviceWithoutTimer = {
    instance: new ClassWithoutTimers(),
    metatype: ClassWithoutTimers
  } as InstanceWrapper<ClassWithoutTimers>;

  const serviceWithTimer = {
    instance: new ClassWith2Timers(),
    metatype: ClassWith2Timers
  } as InstanceWrapper<ClassWith2Timers>;

  describe('servicesWithMethods should', () => {
    it('return a list of all services', () => {
      expect(
        AzureFunctionExplorer.servicesWithMethods([serviceWithTimer])
      ).toHaveLength(1);
    });

    it('return list of all method', () => {
      const servicesWithMethods = AzureFunctionExplorer.servicesWithMethods([
        serviceWithTimer
      ]);
      const methods = servicesWithMethods[0][1];
      expect(methods).toHaveLength(5);
    });
  });

  describe('servicesWithTriggerMethods should', () => {
    it('return an empty list if there are no triggers', () => {
      const servicesWithMethods = AzureFunctionExplorer.servicesWithMethods([
        serviceWithoutTimer
      ]);

      const servicesWithTriggerMethods =
        AzureFunctionExplorer.servicesWithTrigger(servicesWithMethods);

      expect(servicesWithTriggerMethods).toHaveLength(0);
    });

    it('return list of all methods with triggers', () => {
      const servicesWithMethods = AzureFunctionExplorer.servicesWithMethods([
        serviceWithTimer
      ]);

      const servicesWithTriggerMethods =
        AzureFunctionExplorer.servicesWithTrigger(servicesWithMethods);

      const methods = servicesWithTriggerMethods[0][1];
      expect(methods).toHaveLength(3);
    });
  });

  describe('servicesWithTriggerForFunction should', () => {
    it('return an empty list if there is no trigger for the function', () => {
      const servicesWithMethods = AzureFunctionExplorer.servicesWithMethods([
        serviceWithoutTimer
      ]);

      const servicesWithTriggerMethods =
        AzureFunctionExplorer.servicesWithTriggerForFunction(
          servicesWithMethods,
          'noTimer'
        );

      expect(servicesWithTriggerMethods).toHaveLength(0);
    });

    it('return list of all methods with triggers for the function', () => {
      const servicesWithMethods = AzureFunctionExplorer.servicesWithMethods([
        serviceWithTimer
      ]);

      const servicesWithTriggerMethods =
        AzureFunctionExplorer.servicesWithTriggerForFunction(
          servicesWithMethods,
          'Function'
        );

      const methods = servicesWithTriggerMethods[0][1];
      expect(methods).toHaveLength(3);
    });
  });

  describe('callWithContext', () => {
    it('should call function with empty params if no context is injected', () => {
      const service = serviceWithTimer.instance;

      const context = new InvocationContext();
      const spy = jest.spyOn(service, 'timer2');

      AzureFunctionExplorer.callWithContext([service, 'timer2'], context);

      expect(spy).toHaveBeenCalledWith();
    });

    it('should call function with context injected if annotated', () => {
      const service = serviceWithTimer.instance;

      const context = new InvocationContext({ invocationId: 'abc' });
      const spy = jest.spyOn(service, 'timerWithContext');

      AzureFunctionExplorer.callWithContext(
        [service, 'timerWithContext'],
        context
      );

      expect(spy).toHaveBeenCalledWith(undefined, context);
    });
  });
});
