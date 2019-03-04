import { get } from 'lodash';
import { map } from 'ramda';
import { sparql } from '../../util';
import { getDbPediaEntityByWikiLink } from '../../queries';
import { Author, SparqlClient, SparqlBinding, HashMap } from '../../types';

export default async function getAuthor(client: SparqlClient, wikiLink: string): Promise<Author> {
  const response = await sparql(client, getDbPediaEntityByWikiLink(wikiLink));

  const bindings = get(response, ['results', 'bindings'], []);

  const flattened = map((binding: SparqlBinding) => map((b: SparqlBinding) => b.value, binding as any), bindings);

  return flattened.reduce(
    (acc: HashMap<any>, next: any) => ({
      ...acc,
      ...Object.keys(next).reduce(
        (a: HashMap<string>, k: string) => ({
          ...a,
          [k]: Array.isArray(acc[k]) ? (acc[k].includes(next[k]) ? acc[k] : acc[k].concat([next[k]])) : [next[k]],
        }),
        {}
      ),
    }),
    {}
  );
}
