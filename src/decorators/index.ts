import 'reflect-metadata';
import keys from './keys';

export const Injectable = () => (target: any) => {
  Reflect.defineMetadata(keys.INJECTABLE, true, target);
  return target;
};

export const Inject = (ref: any) => (target: any, value: string) => {
  Reflect.defineMetadata(keys.INJECT, ref, target, value);
  return target;
};
