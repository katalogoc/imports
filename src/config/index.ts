require('dotenv').config();
import nconf from 'nconf';
import defaults from './config';

const config = nconf
  .env()
  .argv()
  .defaults(defaults);

export default config;
