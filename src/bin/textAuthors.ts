#!/usr/bin/node

import config from '../config';
import SparqlClient from 'sparql-client';
import getAuthorsWikiLinks from '../modules/textAuthors/getAuthorsWikiLinks';
import getAuthor from '../modules/textAuthors/getAuthor';
import { inspect } from 'util';

(async () => {
  const textClient = new SparqlClient(`${config.get('FUSEKI_URL')}/texts`);

  const dbPediaClient = new SparqlClient(config.get('DB_PEDIA_SPARQL_URL'));

  for await (const link of getAuthorsWikiLinks(textClient)) {
    const author = await getAuthor(dbPediaClient, link);

    console.log('----------------------------------');
    console.log(inspect(author, { depth: null }));
  }
})();
