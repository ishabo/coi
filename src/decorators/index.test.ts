import 'reflect-metadata';
import { Injectable, Inject } from '.';
import keys from './keys';

describe('decorators', () => {
  @Injectable()
  class SomeClass {}

  describe('Injectable', () => {
    it('defines meta data on class with a predefined key', () => {
      expect(Reflect.getMetadata(keys.INJECTABLE, SomeClass)).toBe(true);
    });
  });

  describe('Inject', () => {
    it('defines meta data on param with predefind key', () => {
      Reflect.defineMetadata = jest.fn();
      const inject = Inject('some-ref');
      const obj = { param: 'value' };
      inject(obj, 'param');
      expect(Reflect.defineMetadata).toHaveBeenCalledWith(
        keys.INJECT,
        'some-ref',
        { param: 'value' },
        'param'
      );
    });
  });
});
