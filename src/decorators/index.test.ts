import 'reflect-metadata';
import { Injectable } from '.';
import keys from './keys';

describe('decorators', () => {
  @Injectable()
  class SomeClass {}

  describe('Injectable', () => {
    it('defines meta data with a predefined key', () => {
      expect(Reflect.getMetadata(keys.INJECTABLE, SomeClass)).toBe(true);
    });
  });
});
