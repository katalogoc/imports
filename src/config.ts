require('dotenv').config();
import nconf from 'nconf';

const defaults = {
  PORT: 8083,
  HOST: '0.0.0.0',
  GUTENBERG_CATALOG: 'http://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.zip',
  GUTENBERG_DOCUMENTS_MAX_COUNT: 1050,
  AMQP_HOST: 'rabbit',
  METADATA_SERVICE_URL: 'http://localhost:8082'
}

const config = nconf
  .env()
  .argv()
  .defaults(defaults);

export default config;
