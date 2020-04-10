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

  @Injectable()
  class SomeService {
    constructor(private readonly logger: Logger) {
      this.logger.log('SomeService intinialized');
    }
  }

  it('injects Logger into SomeService', () => {
    const container = new Container();
    container.register({ ref: Logger, source: Logger, type: 'class' });
    const someService = container.construct(SomeService);
    expect(console.log).toHaveBeenCalled();
  });
});
