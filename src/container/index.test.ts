import { Container } from '.';
import { Injectable, Inject } from '../decorators';
import { InjectableRef } from '../injectable-ref';

const LogFileRef = new InjectableRef('ERROR_FILE_REF');
const ErrorFileRef = new InjectableRef('ERROR_FILE_REF');

/* tslint:disable: max-classes-per-file */
class Logger {
  public log(...args: any[]) {
    console.log('[log]', ...args);
  }
}

@Injectable()
class MyLogger {
  constructor(@Inject(LogFileRef) public logFileRef: string) {}
  public log(...args: any[]) {
    console.log('[my-log]', ...args);
  }
}

@Injectable()
class MyOtherLogger {
  constructor(
    @Inject(LogFileRef) public logFileRef: string,
    @Inject(ErrorFileRef) public errorFileRef?: undefined | string
  ) {}
  public log(...args: any[]) {
    console.log('[my-log]', ...args);
  }
  public error(...args: any[]) {
    console.error('[my-error]', ...args);
  }
}

@Injectable()
class ApiService {
  constructor(private readonly logger: Logger) {
    this.logger.log('ApiService initialized');
  }
  async getData() {
    return { id: 'id', name: 'name' };
  }
}

@Injectable()
class ProductService {
  constructor(private readonly api: ApiService) {}
  async getProduct() {
    return await this.api.getData();
  }
}

@Injectable()
class Class1 {
  constructor(private param: Class2) {}
}

@Injectable()
class Class2 {
  constructor(private param: Class1) {}
}

describe('Container', () => {
  console.log = jest.fn();

  class AltLogger {
    public log(...args: any[]) {
      console.log('[alt-log]', ...args);
    }
  }

  afterEach(() => {
    (console.log as any).mockClear();
  });

  it('injects Logger into ApiService', () => {
    const container = new Container();
    container
      .inject({ ref: Logger, source: Logger, type: 'class' })
      .into(ApiService);
    expect(console.log).toHaveBeenCalledWith('[log]', 'ApiService initialized');
  });

  it('can substitute for another dependency of the same type', () => {
    const container = new Container();
    container
      .inject({ ref: Logger, source: AltLogger, type: 'class' })
      .into(ApiService);
    expect(console.log).toHaveBeenCalledWith(
      '[alt-log]',
      'ApiService initialized'
    );
  });

  it('can recursively inject class dependencies', async () => {
    const container = new Container();
    const productService = container
      .inject({ ref: Logger, source: Logger, type: 'class' })
      .and({ ref: ApiService, source: ApiService, type: 'class' })
      .into(ProductService);
    expect(await productService.getProduct()).toEqual({
      id: 'id',
      name: 'name'
    });
  });

  it('injects a param into an injectable class', () => {
    const container = new Container();

    const myLogger = container
      .inject({ ref: LogFileRef, source: 'log.txt', type: 'param' })
      .into(MyLogger);
    expect(myLogger.logFileRef).toEqual('log.txt');
  });

  it('throws an error if a dependency is missing', () => {
    const container = new Container();

    expect(() => {
      container
        .inject({ ref: LogFileRef, source: 'log.txt', type: 'param' })
        .into(MyOtherLogger);
    });
  });

  it('inject more than one param into an injectable class', () => {
    const container = new Container();

    const myLogger = container
      .inject({ ref: LogFileRef, source: 'log.txt', type: 'param' })
      .and({
        ref: ErrorFileRef,
        source: 'error.txt',
        type: 'param'
      })
      .into(MyOtherLogger);
    expect(myLogger.logFileRef).toEqual('log.txt');
    expect(myLogger.errorFileRef).toEqual('error.txt');
  });

  it('throws an error if dependency is circular', () => {
    const container = new Container();

    expect(() => {
      container
        .inject({
          ref: Class1,
          source: Class1,
          type: 'class'
        })
        .and({
          ref: Class2,
          source: Class2,
          type: 'class'
        })
        .into(Class1);
    }).toThrowError('Recursive dependency');
  });
});
