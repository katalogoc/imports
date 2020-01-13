import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import config from '../config';
import { GutenbergText } from './types';

const METADATA_SERVICE_URL = config.get('METADATA_SERVICE_URL');

const client = new ApolloClient({
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    },
    link: ApolloLink.from([
        new HttpLink({
            uri: `${METADATA_SERVICE_URL}/api`,
        }),
    ]),
    cache: new InMemoryCache(),
});

export async function getAuthorByWikiUrl(wikiUrl: string) {
    const query = gql`
        query getAuthors($filter: AuthorFilterInput) {
            authors(filter: $filter) {
                id
            }
        }
    `;
    const response = await client.query({
        query,
        variables: {
            filter: {
                operations: [
                    {
                        type: 'eq',
                        field: 'xid',
                        value: wikiUrl,
                    },
                ],
            },
        },
    });
    return response.data?.authors?.[0] ?? null;
}

export async function saveAuthor(author: any) {
    const mutation = gql`
        mutation saveAuthor($author: SaveAuthorInput!) {
            saveAuthor(author: $author)
        }
    `;
    const response = await client.mutate({
        mutation,
        variables: { author },
    });
    return response.data?.saveAuthor ?? null;
}

export async function saveText(text: GutenbergText): Promise<string> {
    const mutation = gql`
        mutation saveText($text: SaveTextInput!) {
            saveText(text: $text)
        }
    `;
    const response = await client.mutate({
        mutation,
        variables: {
            text: {
                xid: text.url,
                source: 'GUTENBERG',
                title: text.title,
                url: text.url || '',
                authors: text.authors,
                subject: [],
            },
        },
    });
    return response.data?.saveText ?? null;
}

export async function getAuthorByName(name: string): Promise<any> {
    const query = gql`
        query getAuthorsByName($filter: AuthorFilterInput, $options: QueryOptions) {
            authors(filter: $filter, options: $options) {
                id
                xid
                source
                birthdate
                deathdate
                name
                alias
                thumbnail
                texts {
                id
                xid
                source
                title
                url
                subject
                }
                __typename
            }
        }
    `;
    const response = await client.query({
        query,
        variables: {
            filter: {
                operations: [
                    {
                        type: 'eq',
                        field: 'name',
                        value: name,
                    },
                ],
            },
        },
    });
    return response.data?.authors?.[0] ?? null;
}
