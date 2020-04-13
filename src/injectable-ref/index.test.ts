import { InjectableRef } from '.';

describe('InjectableRef', () => {
  it('initializes with public ref identifier', () => {
    const injectionRef = new InjectableRef('some-ref');
    expect(injectionRef.ref).toEqual('some-ref');
  });
});
