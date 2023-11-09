<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master

[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux

[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Azure Functions](https://code.visualstudio.com/tutorials/functions-extension/getting-started) Trigger module
for [Nest](https://github.com/nestjs/nest).

This package works well together with [@nestjs/azure-func-http](https://github.com/nestjs/azure-func-http) which
provides azure function http triggers for Nest.

This package provides a more general way to use any kind
of [azure function trigger](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings?tabs=csharp#supported-bindings) (
timed, event bus, ...) for triggering methods of your Nest services.

## Installation

Using npm:

```bash
$ npm install nestjs-azure-func-trigger
```

## Tutorial

Adding a trigger is done by creating a new Azure Function in the app folder and then providing the createApp to the
AzureFunctionTriggerAdapter.

```typescript
import { InvocationContext } from '@azure/functions';
import { AzureFunctionTriggerAdapter } from 'nestjs-azure-func-trigger';
import { createApp } from '../src/main';

export default async function(context: InvocationContext): Promise<void> {
  return AzureFunctionTriggerAdapter.handle(createApp, context);
}
```

When the function is triggered it starts up and calls every service method that is annotated with AzureFunctionTrigger
decorator that specified this function by the name parameter.

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
class ClassWithTrigger {
  @AzureFunctionTrigger('FunctionName')
  public timerWithContext (
    @AzureFunctionContext() context: InvocationContext,
  ) {
    context.log('TimerWithContext', context);
  }
}
```

A function.json for this case looks like the following. Important is only the name of the function folder which in this
case is "_FunctionName_"

```json
{
  "bindings": [
    {
      "name": "trigger",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 0,30 7-23 * * *"
    }
  ],
  "scriptFile": "../dist/FunctionName/index.js"
}
```
