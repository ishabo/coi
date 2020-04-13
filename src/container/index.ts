import 'reflect-metadata';
import { InjectableRef } from '../injectable-ref';
import keys from '../decorators/keys';

type TConstructor<T> = new (...args: any[]) => T;

type TRef<T> = InjectableRef | TConstructor<T>;

type TSource<T> = TConstructor<T> | T;

interface IClassDependency<T> {
  ref: TRef<T>;
  source: TConstructor<T>;
  type: 'class';
}

interface IParamDependency<T> {
  ref: TRef<T>;
  source: T;
  type: 'param';
}

type TDependency<T = any> = IClassDependency<T> | IParamDependency<T>;

export class Container {
  private registrar = new Map<TRef<any>, TDependency>();

  public inject = <T>(dependency: TDependency<T>) => {
    this.register(dependency);
    return this;
  };

  public and = <T>(dependency: TDependency<T>) => {
    if (this.registrar.size === 0) {
      throw new Error('You need to call inject first');
    }
    this.register(dependency);
    return this;
  };

  public into = <T>(target: TRef<T>) => {
    return this.construct(target);
  };

  private register = <T>(dependency: TDependency<T>) => {
    this.registrar.set(dependency.ref, dependency);
  };

  private construct<T>(target: TRef<T>): T {
    let registeredDependency = this.registrar.get(target);
    if (
      registeredDependency === undefined &&
      !(target instanceof InjectableRef)
    ) {
      registeredDependency = {
        ref: target,
        source: target as TConstructor<T>,
        type: 'class'
      };
    }

    return this.injectDependency(target, registeredDependency);
  }

  private injectDependency<T>(target: TRef<T>, dependency?: TDependency<T>): T {
    if (dependency === undefined) {
      throw new Error(`Dependency missing`);
    }
    if (dependency.type === 'class') {
      const source = dependency.source;
      const params = this.getParams(source);
      return Reflect.construct(source, params);
    } else {
      return dependency.source;
    }
  }

  private getParams<T>(target: TConstructor<T>) {
    const params = Reflect.getMetadata('design:paramtypes', target) || [];
    return params.map((param: InjectableRef, index: number) => {
      if (param === undefined) {
        throw new Error('Recursive dependency');
      }
      const ref =
        Reflect.getMetadata(keys.INJECT, target, String(index)) || param;
      const dependency = this.registrar.get(ref);
      return this.injectDependency(target, dependency as TDependency<T>);
    });
  }
}
