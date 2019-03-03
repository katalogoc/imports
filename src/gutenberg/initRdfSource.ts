import fs from 'fs';
import mkdirp from 'mkdirp';
import AdmZip from 'adm-zip';
import { join } from 'path';
import { promisify } from 'util';
import createLogger from 'hyped-logger';
import { download, untar } from '../utils';
import config from '../config';

const GUTENBERG_DIR = join(process.env.HOME || '~', '.gutenberg');

const RDF_PATH = join(GUTENBERG_DIR, 'tmp', 'rdf');

const logger = createLogger();

const exists = promisify(fs.exists);

export async function init(rdfPath: string = RDF_PATH): Promise<string> {
  await promisify(mkdirp)(RDF_PATH);

  const ZIP_FILE = join(rdfPath, 'catalog.zip');

  const TAR_FILE = join(rdfPath, 'rdf-files.tar');

  const EXTRACTED_DIR = join(rdfPath, 'extracted');

  if (await exists(EXTRACTED_DIR)) {
    logger.info('Found cached catalog. Download skipped');

    return EXTRACTED_DIR;
  } else {
    logger.info(`Start downloading Gutenberg catalog from ${config.get('GUTENBERG_CATALOG')} to ${ZIP_FILE}`);

    await download(config.get('GUTENBERG_CATALOG'), ZIP_FILE);

    logger.info('Download successful!');

    logger.info(`Start extracting to ${EXTRACTED_DIR}`);

    const zip = new AdmZip(ZIP_FILE);

    await zip.extractAllTo(rdfPath, true);

    await untar(TAR_FILE, EXTRACTED_DIR);

    logger.info('Done!');
  }

  return rdfPath;
}
