import { extname } from 'path';
import fs from 'fs';
import R from 'ramda';
import { promisify } from 'util';
import { traverse, filter, map, take } from '../utils';
import createLogger from 'hyped-logger';
import fetch from 'isomorphic-fetch';

const logger = createLogger();

const readFile = promisify(fs.readFile);

const pipe: any = R.pipe;

export const load = (rootDir: string, url: string, maxCount: number) =>
  pipe(
    traverse,
    filter((file: string) => extname(file) === '.rdf'),
    take(maxCount),
    map(async (file: string) => {
      const rdf: string = await readFile(file, 'utf8');

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/rdf+xml',
        },
        body: rdf,
      });

      logger.info(`${file} loaded to ${url}`);
    })
  )(rootDir, undefined);
