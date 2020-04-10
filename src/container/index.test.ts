import { Container } from '.';
import { Injectable } from '../decorators';

/* tslint:disable: max-classes-per-file */
describe('Container', () => {
  console.log = jest.fn();

  class Logger {
    public log(...args: any[]) {
      console.log('[log]', ...args);
    }
  }

  class MyLogger {
    public log(...args: any[]) {
      console.log('[my-log]', ...args);
    }
  }

  @Injectable()
  class SomeService {
    constructor(private readonly logger: Logger) {
      this.logger.log('SomeService initialized');
    }
  }

  afterEach(() => {
    (console.log as any).mockClear();
  });
  it('injects Logger into SomeService', () => {
    const container = new Container();
    container.register({ ref: Logger, source: Logger, type: 'class' });
    const someService = container.construct(SomeService);
    expect(console.log).toHaveBeenCalledWith(
      '[log]',
      'SomeService initialized'
    );
  });

  it('can substitute for another dependency of the same type', () => {
    const container = new Container();
    container.register({ ref: Logger, source: MyLogger, type: 'class' });
    const someService = container.construct(SomeService);
    expect(console.log).toHaveBeenCalledWith(
      '[my-log]',
      'SomeService initialized'
    );
  });
});
