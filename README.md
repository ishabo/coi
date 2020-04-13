# DiCoI - DI/IoC Container

DiCoI is a simple Dependency injection / Inversion of Control Container example in Typescript that enables developers handle automatic dependency injection.

## Installation

```bash
yarn add dicoi
```

## Usage

```typescript
import { Container, @Injectable, @Inject, InjectionRef } from 'dicoi';

const BASE_URL = new InjectionRef('BASE_URL');

export class Logger {
  public log(...args: any[]) {
    console.log('[log]', ...args);
  }
}

@Injectable()
class ApiService {
  constructor(@Inject(BASE_URL) private baseUrl, private logger: Logger) {
    this.logger.log('ApiService initialized');
  }

  async getData(endpoint: string) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`);
    return await response.json();
  }
}

@Injectable()
class ProductService {
  constructor(private readonly api: ApiService) {}
  async getProduct(id: string) {
    return await this.api.getData(`/products/${id}`);
  }
}

const container = new Container();

const products = container.inject({ ref: Logger, source: Logger, type: 'class' })
         .and({ ref: BASE_URL, source: 'http://myservice.com/api', type: 'param' })
         .and({ ref: ApiService, source: ApiService, type: 'class' })
         .into(ProductService);

product.getProduct('61501');

```
