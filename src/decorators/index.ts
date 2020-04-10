import 'reflect-metadata';
import keys from './keys';

export const Injectable = () => (target: any) => {
  Reflect.defineMetadata(keys.INJECTABLE, true, target);
  return target;
};

