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
import { GutenbergText, GutenbergAuthor } from '../types';
import { getAuthorByWikiUrl, saveAuthor, saveText } from '../api/metadataServiceApi';
import tryToCatch from 'try-to-catch';

const GUTENBERG_DIR = join(process.env.HOME || '~', '.gutenberg');

const RDF_PATH = join(GUTENBERG_DIR, 'tmp', 'rdf');

const logger = createLogger();

const exists = promisify(fs.exists);

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
    logger.debug(`Start extracting to ${EXTRACTED_DIR}`);
    try {
      await unzip(ZIP_FILE, RDF_PATH);
      logger.debug('Unzipped');
    } catch (error) {
      logger.error(`Could't unzip Gutenberg catalog, ${error}`);
      throw error;
    }
    try {
      await untar(TAR_FILE, EXTRACTED_DIR);
      logger.debug('Untared')
    } catch (error) {
      logger.error(`Could't untar Gutenberg catalog, ${error}`);
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
        const rdf: string = await fs.promises.readFile(file, 'utf8');
        const document = new GutenbergDocument(rdf, 'application/rdf+xml');
        return document.getPayload();
      }))

export const enqueuePayloads = async (payloads: GutenbergText[]) => {
  const paylaodsSorted = payloads.slice().sort((a: GutenbergText, b: GutenbergText) => _.get(a.authors, '0.deathdate', Infinity) - _.get(b.authors, '0.deathdate', Infinity));

  for (const payload of paylaodsSorted) {
    const authorIds: string[] = [];

    for (const author of payload.authors) {
      const wikiUrl = author.webpage?.slice(author.webpage?.indexOf('wikipedia.org')) || '';
      const [retrievalFailed, existingAuthor] = await tryToCatch(getAuthorByWikiUrl, wikiUrl);
      if (retrievalFailed) {
        logger.error(`Retrieval of the author has failed, wiki url - ${wikiUrl}, error - ${retrievalFailed}`);

        throw retrievalFailed;
      }
      const [saveFailed, authorId] = await tryToCatch(saveAuthor, {
        id: existingAuthor ? existingAuthor.id : null,
        xid: wikiUrl,
        source: 'DBPEDIA',
        birthdate: author.birthdate,
        deathdate: author.deathdate,
        name: author.name,
        alias: author.alias,
        texts: [],
        thumbnail: author.thumbnail,
      });
      if (saveFailed) {
        logger.error(`Saving of the author has failed, wiki url - ${wikiUrl}, error - ${saveFailed}`);

        throw retrievalFailed;
      }
      authorIds.push(authorId);
    }

    const [saveTextFailed] = await tryToCatch(saveText, {
      ...payload,
      authors: authorIds,
    });
    if (saveTextFailed) {
      logger.error(`Saving of the text has failed, text's title - ${payload.title}, error - ${saveTextFailed}`);

      throw saveTextFailed;
    }
  }
}
export const uploadData = async () => {
  logger.debug('Getting files...');
  const files = await promisify(glob)(`${RDF_PATH}/**/*.rdf`);
  logger.debug('Reading files...');
  const payloads = await getPayloads(files);
  logger.debug('Reading done, saving to the database...')
  await enqueuePayloads(payloads);
}

export const sync = () => downloadCatalog().then(uploadData);


