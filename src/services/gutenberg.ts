import fs from 'fs';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import { join } from 'path';
import { promisify } from 'util';
import createLogger from 'hyped-logger';
import { download, untar, unzip, traverse } from '../util';
import config from '../config';
import { extname } from 'path';
import queue from '../api/queue';
import GutenbergDocument from '../lib/GutenbergDocument';
import { GutenbergText } from 'src/types';

const GUTENBERG_DIR = join(process.env.HOME || '~', '.gutenberg');

const RDF_PATH = join(GUTENBERG_DIR, 'tmp', 'rdf');

const logger = createLogger();

const exists = promisify(fs.exists);

const readFile = promisify(fs.readFile);

export const downloadCatalog = async () => {
  await promisify(mkdirp)(RDF_PATH);

  const ZIP_FILE = join(RDF_PATH, 'catalog.zip');

  const TAR_FILE = join(RDF_PATH, 'rdf-files.tar');

  const EXTRACTED_DIR = join(RDF_PATH, 'extracted');

  if (await exists(EXTRACTED_DIR)) {
    logger.info('Found cached catalog. Download skipped');

    return;
  } else {
    logger.info(`Start downloading Gutenberg catalog from ${config.get('GUTENBERG_CATALOG')} to ${ZIP_FILE}`);

    try {
      await download(config.get('GUTENBERG_CATALOG'), ZIP_FILE);

      logger.info('Download successful!');
    } catch (error) {
      logger.error(`Could't download Gutenberg catalog`);

      throw error;
    }

    try {
      logger.info(`Start extracting to ${EXTRACTED_DIR}`);

      await unzip(ZIP_FILE, RDF_PATH);

      logger.info('Unzipped');

      await untar(TAR_FILE, EXTRACTED_DIR);

      logger.info('Untared')
    } catch (error) {
      logger.error(`Could't unarchive Gutenberg catalog, ${error}`);

      throw error;
    }

    logger.info('Done!');
  }
}

export const getPayloads = (files: string[]) =>
  Promise.all(
    files
      .slice(0, config.get('GUTENBERG_DOCUMENTS_MAX_COUNT'))
      .filter((file: string) => extname(file) === '.rdf')
      .map(async (file: string) => {
        const rdf: string = await readFile(file, 'utf8');

        const document = new GutenbergDocument(rdf, 'application/rdf+xml');

        return document.getPayload();
      }))

export const enqueuePayloads = (payloads: GutenbergText[]) =>
  Promise.all(
    payloads
      .sort((a: GutenbergText, b: GutenbergText) => _.get(a.authors, '0.deathdate', Infinity) - _.get(b.authors, '0.deathdate', Infinity))
      .map((payload: GutenbergText) =>
        queue
          .enqueue({
            type: 'TEXT_CREATED',
            payload
          })
          .catch((err: Error) => logger.error(`Couldn't enqueue payload for title: ${payload.title}, error ${err}`)))
  )
export const uploadData = async () => {
  const files = await traverse(RDF_PATH);

  const payloads = await getPayloads(files);

  await enqueuePayloads(payloads);
}

export const sync = () => downloadCatalog().then(uploadData);


