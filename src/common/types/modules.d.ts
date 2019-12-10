declare module 'hyped-logger' {
  const logger: any
  export = logger;
}

declare module 'apollo-server-redis';

declare module 'try-to-catch' {
  type Result<T> = [
    Error,
    T,
  ];
  type Type = <O = any, I1 = any, I2 = any, I3 = any, I4 = any>(i?: I1, i2?: I2, i3?: I3, i4?: I4) => Result<O>;
  const fn: Type;
  export = fn;
}