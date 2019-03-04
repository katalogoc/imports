import { TextAPIInterface } from './types';

export default class TextAPI implements TextAPIInterface {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  public async getTextsAuthors(): Promise<any> {
    await this.client.query(`
      PREFIX dc: <http://purl.org/dc/terms/>
      PREFIX pg: <http://www.gutenberg.org/2009/pgterms/>
      PREFIX gb: <http://www.gutenberg.org/2009/>

      SELECT *
      WHERE {
        ?subject dc:creator/pg:name ?name;
                dc:creator/pg:alias ?alias;
                dc:creator/pg:deathdate ?deathdate;
                dc:creator/pg:birthdate ?birthdate;
                dc:creator/pg:webpage ?webpage
      }
    `);
  }
}

export const init = (client: any) => new TextAPI(client);
