#!/usr/bin/node

import textImport from '../modules/texts';
import config from '../config';

(async () => {
  const path = await textImport.init();

  const responses = textImport.load(
    path,
    `${config.get('FUSEKI_URL')}/texts`,
    config.get('GUTENBERG_DOCUMENTS_MAX_COUNT')
  );

  for await (const response of responses) {
    console.log(`Response: `, response);
  }
})();
