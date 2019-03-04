import { get } from 'lodash';
import { sparql } from '../../util';
import { FetchOptions } from './types';
import { getAuthorWikiLinks } from '../../queries';

const DEFAULT_OFFSET = 0;

const DEFAULT_LIMIT = 100;

const defaults: FetchOptions = {
  offset: DEFAULT_OFFSET,
  limit: DEFAULT_LIMIT,
};

const fetchWikiLinks = async (sparqlClient: any, { limit, offset }: FetchOptions) =>
  sparql(sparqlClient, `${getAuthorWikiLinks()} LIMIT ${limit} OFFSET ${offset}`);

export default async function* getWikiLinks(
  sparqlClient: any,
  { limit, offset } = defaults
): AsyncIterableIterator<string> {
  const response = await fetchWikiLinks(sparqlClient, { limit, offset });

  const bindings = get(response, ['results', 'bindings'], []);

  for (const binding of bindings) {
    yield get(binding, ['webpage', 'value'], '');
  }

  if (bindings.length) {
    yield* getWikiLinks(sparqlClient, {
      limit,
      offset: offset + limit,
    });
  }
}
