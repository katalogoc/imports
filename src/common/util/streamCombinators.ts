export const filter = <T>(predicate: (val: T) => boolean) =>
  async function*(readable: AsyncIterableIterator<T>): AsyncIterableIterator<T> {
    for await (const chunk of readable) {
      if (predicate(chunk)) {
        yield chunk;
      }
    }
  };

export const map = <I, O = any>(mapper: (val: I) => O) =>
  async function*(readable: AsyncIterableIterator<I>) {
    for await (const chunk of readable) {
      yield mapper(chunk);
    }
  };

export const take = <T>(n: number) =>
  async function*(readable: AsyncIterableIterator<T>) {
    for await (const x of readable) {
      if (n <= 0) {
        return;
      }
      n--;
      yield x;
    }
  };
