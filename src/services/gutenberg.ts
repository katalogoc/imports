import fs from 'fs';
import mkdirp from 'mkdirp';
import AdmZip from 'adm-zip';
import { join } from 'path';
import { promisify } from 'util';
import createLogger from 'hyped-logger';
import { download, untar, unzip } from '../util';
import config from '../config';
import { extname } from 'path';
import R from 'ramda';
import { traverse, filter, map, take } from '../util';
import queue from '../api/queue';

const GUTENBERG_DIR = join(process.env.HOME || '~', '.gutenberg');

const RDF_PATH = join(GUTENBERG_DIR, 'tmp', 'rdf');

const logger = createLogger();

const exists = promisify(fs.exists);

const readFile = promisify(fs.readFile);

const pipe: any = R.pipe;

const gutenbergService = {
  async init(rdfPath: string = RDF_PATH): Promise<string> {
    await promisify(mkdirp)(RDF_PATH);

    const ZIP_FILE = join(rdfPath, 'catalog.zip');

    const TAR_FILE = join(rdfPath, 'rdf-files.tar');

    const EXTRACTED_DIR = join(rdfPath, 'extracted');

    if (await exists(EXTRACTED_DIR)) {
      logger.info('Found cached catalog. Download skipped');

      return EXTRACTED_DIR;
    } else {
      logger.info(`Start downloading Gutenberg catalog from ${config.get('GUTENBERG_CATALOG')} to ${ZIP_FILE}`);

      try {
        const zipFileExists = await exists(ZIP_FILE);

        if (!zipFileExists) {
          await download(config.get('GUTENBERG_CATALOG'), ZIP_FILE);
        }

        logger.info('Download successful!');
      } catch (error) {
        logger.error(`Could't download Gutenberg catalog`);

        throw error;
      }

      try {
        logger.info(`Start extracting to ${EXTRACTED_DIR}`);

        await unzip(ZIP_FILE, rdfPath);

        logger.info('Unzipped');

        await untar(TAR_FILE, EXTRACTED_DIR);

        logger.info('Untared')
      } catch (error) {
        logger.error(`Could't unarchive Gutenberg catalog, ${error}`);

        throw error;
      }

      logger.info('Done!');
    }

    return rdfPath;
  },
  async load(rootDir: string, url: string, maxCount: number) {
    const stream = pipe(
      traverse,
      filter((file: string) => extname(file) === '.rdf'),
      take(maxCount),
      map(async (file: string) => {
        const rdf: string = await readFile(file, 'utf8');

        await queue.enqueue({
          type: 'TEXT_CREATED',
          format: 'rdf',
          data: rdf,
        });

        return null;
      })
    )(rootDir, undefined);

    for await (const _ of stream) {
    }
  },
  async sync() {
    const rdfPath = await gutenbergService.init();

    const fusekiUrl = `${config.get('FUSEKI_URL')}/texts`;

    const docMaxCount = config.get('GUTENBERG_DOCUMENTS_MAX_COUNT');

    await gutenbergService.load(rdfPath, fusekiUrl, docMaxCount);
  },
};

export default gutenbergService;
