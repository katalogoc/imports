import * as dgraph from 'dgraph-js';
import glob from 'glob';
import fs from 'fs';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import { join } from 'path';
import { promisify } from 'util';
import createLogger from 'hyped-logger';
import { download, untar, unzip } from '../util';
import config from '../config';
import GutenbergDocument from '../lib/GutenbergDocument';
import dgraphClient from '../lib/dgraphClient';
import { GutenbergText } from '../types';

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
    logger.debug('Found cached catalog. Download skipped');

    return;
  } else {
    logger.debug(`Start downloading Gutenberg catalog from ${config.get('GUTENBERG_CATALOG')} to ${ZIP_FILE}`);

    try {
      await download(config.get('GUTENBERG_CATALOG'), ZIP_FILE);

      logger.debug('Download successful!');
    } catch (error) {
      logger.error(`Could't download Gutenberg catalog`);

      throw error;
    }

    try {
      logger.debug(`Start extracting to ${EXTRACTED_DIR}`);

      await unzip(ZIP_FILE, RDF_PATH);

      logger.debug('Unzipped');

      await untar(TAR_FILE, EXTRACTED_DIR);

      logger.debug('Untared')
    } catch (error) {
      logger.error(`Could't unarchive Gutenberg catalog, ${error}`);

      throw error;
    }

    logger.debug('Done!');
  }
}

export const getPayloads = (files: string[]) =>
  Promise.all(
    files
      .slice(0, config.get('GUTENBERG_DOCUMENTS_MAX_COUNT'))
      .map(async (file: string) => {
        const rdf: string = await readFile(file, 'utf8');

        const document = new GutenbergDocument(rdf, 'application/rdf+xml');

        return document.getPayload();
      }))

export const enqueuePayloads = (payloads: GutenbergText[]) =>
  Promise.all(
    payloads
      .sort((a: GutenbergText, b: GutenbergText) => _.get(a.authors, '0.deathdate', Infinity) - _.get(b.authors, '0.deathdate', Infinity))
      .map(async (payload: GutenbergText) => {
        const mu = new dgraph.Mutation();

        mu.setSetJson({
          uid: `_:${payload.title}`,
          ...payload,
          type: 'Text'
        });

        const txn = dgraphClient.newTxn();

        try {
          const res = await txn.mutate(mu);

          logger.debug(`Saved: ${res}`)

          await txn.commit();
        } catch (err) {
          logger.warn(`Couldn't save gutenberg text, err: ${err}`);
        } finally {
          await txn.discard();
        }
      })
  )
export const uploadData = async () => {
  logger.debug('Getting files...');

  const files = await promisify(glob)(`${RDF_PATH}/**/*.rdf`);

  logger.debug('Reading files...');

  const payloads = await getPayloads(files);

  logger.debug('Reading done, saving to the database...')

  await enqueuePayloads(payloads);
}

export const sync = () => downloadCatalog().then(uploadData);


