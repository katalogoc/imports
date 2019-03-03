import { join } from 'path';
import fs from 'fs';
import http, { IncomingMessage } from 'http';
import createLogger from 'hyped-logger';
import { promisify } from 'util';
import tar from 'tar-fs';

const readdir = promisify(fs.readdir);

const logger = createLogger();

const defaultReadDirOptions = {
  encoding: 'utf8',
  withFileTypes: true,
};

export async function* traverse(
  dir: string,
  readDirOptions: object = defaultReadDirOptions
): AsyncIterableIterator<string> {
  const files = await readdir(dir, {
    withFileTypes: true,
    ...readDirOptions,
  }).catch((error: Error) => {
    logger.error(`Traverse failed on dir ${dir}\n${error}`);

    throw error;
  });

  for (const file of files) {
    const filePath = join(dir, file.name);

    if (file.isDirectory()) {
      yield* traverse(filePath);
    } else {
      yield filePath;
    }
  }
}

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

export const download = (url: string, dest: string) => {
  const file = fs.createWriteStream(dest);

  return new Promise((resolve: any, reject: any) => {
    http
      .get(url, (response: IncomingMessage) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(); // close() is async, call cb after close completes.
          resolve();
        });
      })
      .on('error', (err: Error) => {
        // Handle errors
        fs.unlink(dest, () => reject(err)); // Delete the file async. (But we don't check the result)
      });
  });
};

export const untar = (tarball: string, dest: string) => {
  const readable = fs.createReadStream(tarball);

  const writable = tar.extract(dest);

  return new Promise((resolve: any, reject: any) => {
    readable.pipe(writable);
    writable.on('finish', resolve);
    writable.on('error', reject);
  });
};
