import { InjectionRef } from '.';

describe('InjectableRef', () => {
  it('initializes with public ref identifier', () => {
    const injectionRef = new InjectionRef('some-ref');
    expect(injectionRef.ref).toEqual('some-ref');
  });
});
