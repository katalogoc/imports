import * as rdflib from 'rdflib';
import _ from 'lodash';
import { GutenbergAuthor, GutenbergText } from '../common/types';

const dcterms = rdflib.Namespace('http://purl.org/dc/terms/');

const pgterms = rdflib.Namespace('http://www.gutenberg.org/2009/pgterms/');

class GutenbergDocument {
    public store: rdflib.Formula;

    constructor(body: string, mimeType: string) {
        this.store = rdflib.graph();

        rdflib.parse(body, this.store, 'http://www.gutenberg.org', mimeType, () => void 0);
    }

    public getTitle(): string {
        const statements = this.store.statementsMatching(null, dcterms('title'));

        return _.get(statements, '0.object.value', null);
    }

    public getUrl(): string {
        const formats = this.store.statementsMatching(null, dcterms('format'));

        const statement = formats.find((s: rdflib.Statement) => !!s.subject.value.match(/\.txt$/));

        return _.get(statement, 'subject.value', null);
    }

    public getAuthors(): GutenbergAuthor[] {
        const statements = this.store.statementsMatching(null, null, pgterms('agent'));

        const getAuthorField = (field: string) => (author: rdflib.Node) => {
            const triples = this.store.statementsMatching(author, pgterms(field));

            return _.get(triples, '0.object.value', null);
        };

        const authors = statements.map(({ subject: author }: rdflib.Statement) => {
            const name = getAuthorField('name')(author);

            const webpage = getAuthorField('webpage')(author);

            const birthdate = getAuthorField('birthdate')(author);

            const deathdate = getAuthorField('deathdate')(author);

            const thumbnail = getAuthorField('thumbnail')(author);

            const alias = this.store.statementsMatching(author, pgterms('alias')).map((s: rdflib.Statement) => _.get(s, 'object.value', null));

            return {
                name,
                alias,
                webpage,
                thumbnail,
                birthdate: birthdate && new Date(birthdate),
                deathdate: deathdate && new Date(deathdate),
            };
        });

        return authors;
    }

    public getPayload(): GutenbergText {
        return {
            authors: this.getAuthors(),
            url: this.getUrl(),
            title: this.getTitle(),
        };
    }
}

export default GutenbergDocument;
