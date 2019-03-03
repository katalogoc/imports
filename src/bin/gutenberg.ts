#!/usr/bin/node

import gutenberg from '../gutenberg';
import config from '../config';

(async () => {
  const path = await gutenberg.init();

  const stream = gutenberg.load(path, config.get('FUSEKI_URL'), config.get('GUTENBERG_DOCUMENTS_MAX_COUNT'));

  for await (const doc of stream) {
  }
})();
