import { join } from 'path';
import fs from 'fs';
import http, { IncomingMessage } from 'http';
import createLogger from 'hyped-logger';
import { promisify } from 'util';
import tar from 'tar-fs';
import unzipper from 'unzipper';

const readdir = promisify(fs.readdir);

const logger = createLogger();

export async function traverse(dir: string): Promise<string[]> {
  const read = (dir: string): Promise<string[]> =>
    readdir(dir, { withFileTypes: true })
      .then(async (files: fs.Dirent[]): Promise<string[]> =>
        files.reduce(async (promise: Promise<string[]>, f: fs.Dirent) =>
          promise.then((result: string[]) =>
            f.isDirectory()
              ? read(join(dir, f.name)).then((nested: string[]) => result.concat(nested))
              : result.concat([join(dir, f.name)])), Promise.resolve([])))
      .catch((error: Error) => {
        logger.error(`Traverse failed on dir ${dir}\n${error}`);

        return Promise.reject(error);
      });

  return read(dir);
}

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

export const unzip = (zipFile: string, dest: string) => {
  return unzipper.Open.file(zipFile).then((d) => d.extract({ path: dest, concurrency: 5 }));
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
