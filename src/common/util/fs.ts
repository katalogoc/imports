import fs from 'fs';
import http, { IncomingMessage } from 'http';
import tar from 'tar-fs';
import unzipper from 'unzipper';

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
