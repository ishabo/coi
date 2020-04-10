import { Container } from '.';
import { Injectable, Inject } from '../decorators';
import { InjectionRef } from '../injectable-ref';

/* tslint:disable: max-classes-per-file */
describe('Container', () => {
  console.log = jest.fn();

  const LogFileRef = new InjectionRef('ERROR_FILE_REF');
  const ErrorFileRef = new InjectionRef('ERROR_FILE_REF');

  class Logger {
    public log(...args: any[]) {
      console.log('[log]', ...args);
    }
  }

  class AltLogger {
    public log(...args: any[]) {
      console.log('[alt-log]', ...args);
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
      @Inject(ErrorFileRef)
      public errorFileRef: undefined | string | object = undefined
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


  it('injects Logger into ApiService', () => {
    const container = new Container();
    container.register({ ref: Logger, source: Logger, type: 'class' });
    container.construct(ApiService);
    expect(console.log).toHaveBeenCalledWith('[log]', 'ApiService initialized');
  });

  it('can substitute for another dependency of the same type', () => {
    const container = new Container();
    container.register({ ref: Logger, source: AltLogger, type: 'class' });
    container.construct(ApiService);
    expect(console.log).toHaveBeenCalledWith(
      '[alt-log]',
      'ApiService initialized'
    );
  });

  it('can recursively inject class dependencies', async () => {
    const container = new Container();
    container.register({ ref: Logger, source: Logger, type: 'class' });
    container.register({ ref: ApiService, source: ApiService, type: 'class' });
    const productService = container.construct(ProductService);
    expect(await productService.getProduct()).toEqual({
      id: 'id',
      name: 'name'
    });
  });

  it('injects a param into an injectable class', () => {
    const container = new Container();

    container.register({ ref: LogFileRef, source: 'log.txt', type: 'param' });
    const myLogger = container.construct(MyLogger);
    expect(myLogger.logFileRef).toEqual('log.txt');
  });

  it('throws an error if a dependency is missing', () => {
    const container = new Container();

    container.register({ ref: LogFileRef, source: 'log.txt', type: 'param' });
    expect(() => {
      container.construct(MyOtherLogger);
    });
  });

  it('inject more than one param into an injectable class', () => {
    const container = new Container();

    container.register({ ref: LogFileRef, source: 'log.txt', type: 'param' });
    container.register({
      ref: ErrorFileRef,
      source: 'error.txt',
      type: 'param'
    });
    const myLogger = container.construct(MyOtherLogger);
    expect(myLogger.logFileRef).toEqual('log.txt');
    expect(myLogger.errorFileRef).toEqual('error.txt');
  });

});
