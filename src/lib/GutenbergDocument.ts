import * as rdflib from 'rdflib';
import { promisify } from 'util';
import _ from 'lodash';
import { format } from 'path';

const parse: (...args: any[]) => void = promisify(rdflib.parse);

const { Namespace } = rdflib;

const dcterms = rdflib.Namespace('http://purl.org/dc/terms/')

const pgterms = rdflib.Namespace('http://www.gutenberg.org/2009/pgterms/');

const rdf = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

class GutenbergDocument {
    store: rdflib.Formula;

    constructor(body: string, mimeType: string) {
        this.store = rdflib.graph();

        parse(body, this.store, 'http://www.gutenberg.org', mimeType)
    }

    getTitle() {
        const statements = this.store.statementsMatching(null, dcterms('title'));
    
        return _.get(statements, '0.object.value', null);
    }

    getUrl() {
        const formats = this.store.statementsMatching(null, dcterms('format'));

        const statement = formats.find((s: rdflib.Statement) => !!s.subject.value.match(/\.txt$/));

        return _.get(statement, 'subject.value', null);
    }

    getAuthors() {
        const statements = this.store.statementsMatching(null, null, pgterms('agent'));

        const getAuthorField = (field: string) => (author: rdflib.Node) => {
            const statements = this.store.statementsMatching(author, pgterms(field));

            return _.get(statements, '0.object.value', null);
        }

        const authors = statements.map(({ subject: author }: rdflib.Statement) => {
            const name = getAuthorField('name')(author);

            const webpage = getAuthorField('webpage')(author);

            const birthdate = getAuthorField('birthdate')(author);

            const deathdate = getAuthorField('deathdate')(author);

            const aliases = this.store.statementsMatching(author, pgterms('alias')).map((s: rdflib.Statement) => _.get(s, 'object.value', null));

            return {
                name,
                aliases,
                webpage,
                birthdate,
                deathdate,
            };
        })

        return authors;
    }
}

export default GutenbergDocument;
