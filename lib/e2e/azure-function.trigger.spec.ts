import { INestApplication } from '@nestjs/common';
import { AzureFunctionTriggerAdapter } from '../azure-function-trigger-adapter';
import { InvocationContext } from '@azure/functionsV4';
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
    ping2Spy
  });

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      imports: [PingModule]
    })
      .overrideProvider(PingService)
      .useValue(pingService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should trigger only functions that are annotated', async () => {
    const context = minimalFunctionContext('Ping');
    await AzureFunctionTriggerAdapter.handle(
      () => Promise.resolve(app),
      context
    );

    expect(otherMethodSpy).not.toHaveBeenCalled();
    expect(pongSpy).not.toHaveBeenCalled();
    expect(pingSpy).toHaveBeenCalledTimes(1);
    expect(ping2Spy).toHaveBeenCalledTimes(1);
  });

  it('should trigger methods with correct context', async () => {
    const context = minimalFunctionContext('Ping');
    await AzureFunctionTriggerAdapter.handle(
      () => Promise.resolve(app),
      context
    );

    expect(pingSpy).toHaveBeenCalledTimes(1);
    expect(pingSpy).toHaveBeenCalledWith(
      undefined,
      context,
      context,
      undefined,
      context
    );
  });
});

function minimalFunctionContext(functionName: string): InvocationContext {
  return new InvocationContext({
    functionName,
    logHandler: console.log
  });
}
