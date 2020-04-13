# DiCoI - DI/IoC Container

DiCoI is a simple Dependency injection / Inversion of Control Container example in Typescript that enables developers handle automatic dependency injection.

## Installation

Using npm:

```bash
$ npm install dicoi
```

```bash
$ yarn add dicoi
```

## Example

Lets suppose a `RatesService` that connects to an API to get currency rates and logs results. It depends on ApiService and Logger. `ApiService` also depends on `Logger` and also requires a param. To automatically initialize RatesService with those dependencies, we'd like to be able to do:

```typescript
import { Container } from 'dicoi';
const container = new Container();

const rates = container
  .inject({ ref: Logger, source: Logger, type: 'class' })
  .and({
    ref: BASE_URL,
    source: 'https://api.exchangeratesapi.io',
    type: 'param'
  })
  .and({ ref: ApiService, source: ApiService, type: 'class' })
  .into(RatesService);

rates.getRate('USD', ['GBP', 'EUR']).then(console.log);
```

DiCoI gives us a `Container` that will handle those dependenies for us. It has declarative methods that enable us to `inject(DEPENDENCY_PARAM_OBJET).and(DEPENDENCY_CLASS_OBJET).into(MAIN_CLASS)`

For this to work, you'll need to decorate `RatesService` and `ApiService` with `@Injectable` decorator, and any dependency (non-class) param must be decorated with `@Inject` decorator.

```typescript
import { Container, Injectable, Inject, InjectableRef } from 'dicoi';

const BASE_URL = new InjectableRef('BASE_URL');

export class Logger {
  public log(...args: any[]) {
    console.log('[log]', ...args);
  }
}

@Injectable()
class ApiService {
  constructor(
    @Inject(BASE_URL) private baseUrl: string,
    private logger: Logger
  ) {
    this.logger.log('ApiService initialized');
  }

  async getData(endpoint: string) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`);
    return await response.json();
  }
}

@Injectable()
class RatesService {
  constructor(
    private readonly api: ApiService,
    private readonly logger: Logger
  ) {
    this.logger.log('Launching rates service');
  }
  async getRate(base: string, symbols: string[]) {
    return await this.api.getData(
      `latest?base=${base}&symbols=${symbols.join(',')}`
    );
  }
}
```

> **NOTE:** that `Logger` class does not need any decorator, because we do not need to inject anything into it.
