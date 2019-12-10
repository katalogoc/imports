import { promisify } from 'util';

export const sparql = (client: any, query: string) => promisify(client.query(query).execute.bind(client))();
