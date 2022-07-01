import { INestApplication } from '@nestjs/common';
import { AzureFunctionTriggerAdapter } from '../azure-function-trigger-adapter';
import { Context } from '@azure/functions';
import { PingService } from './src/ping/ping.service';
import { PingModule } from './src/ping/ping.module';
import { Test } from '@nestjs/testing';

describe('AzureFunctionTrigger', () => {
  let otherMethodSpy = jest.fn();
  let pongSpy = jest.fn();
  let pingSpy = jest.fn();
  let ping2Spy = jest.fn();

  let app: INestApplication;
  let pingService = new PingService({
    otherMethodSpy,
    pongSpy,
    pingSpy,
    ping2Spy,
  });

  beforeAll(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      imports: [PingModule],
    })
      .overrideProvider(PingService)
      .useValue(pingService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should trigger only funtions that ', async () => {
    const context = minimalFunctionContext('Ping');
    await AzureFunctionTriggerAdapter.handle(
      () => Promise.resolve(app),
      context,
    );

    expect(otherMethodSpy).not.toHaveBeenCalled();
    expect(pongSpy).not.toHaveBeenCalled();
    expect(pingSpy).toHaveBeenCalledTimes(1);
    expect(ping2Spy).toHaveBeenCalledTimes(1);
  });
});

function minimalFunctionContext(functionName: string) {
  return {
    executionContext: {
      functionName,
    },
    log: console.log,
  } as Context;
}
