import { Injectable, Logger } from '@nestjs/common';
import { AzureFunctionTrigger } from '../../../decorators/azure-function-trigger';

@Injectable()
export class PingService {
  private readonly otherMethodSpy: Function;
  private readonly pongSpy: Function;
  private readonly pingSpy: Function;
  private readonly ping2Spy: Function;

  constructor(config: {
    otherMethodSpy: Function;
    pongSpy: Function;
    pingSpy: Function;
    ping2Spy: Function;
  }) {
    this.otherMethodSpy = config.otherMethodSpy;
    this.pongSpy = config.pongSpy;
    this.pingSpy = config.pingSpy;
    this.ping2Spy = config.ping2Spy;
  }

  private readonly logger = new Logger(PingService.name);

  public otherMethod() {
    this.otherMethodSpy();
    this.logger.log('other');
  }

  @AzureFunctionTrigger('Pong')
  public pong() {
    this.pongSpy();
    this.logger.log('pong');
  }

  @AzureFunctionTrigger('Ping')
  public ping() {
    this.pingSpy();
    this.logger.log('ping');
  }

  @AzureFunctionTrigger('Ping')
  public ping2() {
    this.ping2Spy();
    this.logger.log('ping 2');
  }
}
