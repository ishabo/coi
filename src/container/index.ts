import 'reflect-metadata';
import { InjectionRef } from '../injection-ref';

type TConstructor<T> = new (...args: any[]) => T;

interface IClassDependency<T> {
  ref: TConstructor<T>;
  source: TConstructor<T>;
  type: 'class';
}

type TDependency<T = any> = IClassDependency<T>;

export class Container {
  private registrar = new Map<TConstructor<any>, TDependency>();

  public register = <T>(dependency: TDependency<T>) => {
    this.registrar.set(dependency.ref, dependency);
  };

  construct<T>(dependency: TConstructor<T>): T {
    let registeredDependency = this.registrar.get(dependency);
    if (registeredDependency === undefined) {
      registeredDependency = {
        ref: dependency as TConstructor<T>,
        source: dependency,
        type: 'class'
      };
    }

    return this.inject(registeredDependency);
  }

  private inject<T>(dependency: TDependency<T>): T | TConstructor<T> {
    if (dependency.type === 'class') {
      const target = dependency.source;
      const params = this.getParams(target);
      return Reflect.construct(target, params);
    } else {
      return dependency.source;
    }
  }

  private getParams<T>(target: TConstructor<T>) {
    const params = Reflect.getMetadata('design:paramtypes', target) || [];
    return params.map((param: TConstructor<T>) => {
      const dependency = this.registrar.get(param);
      if (dependency) {
        return this.inject(dependency);
      } else {
        return param;
      }
    });
  }
}
