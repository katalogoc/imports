import GutenbergDocument from '../GutenbergDocument';
import fs from 'fs';
import { resolve } from 'path';

const shakespeareWorks = fs.readFileSync(resolve('fixtures/rdf-xml/complete-works-of-william-shakespeare.rdf'), { encoding: 'utf-8' });

const shakespeareWorksWithoutLivingDates = fs.readFileSync(resolve('fixtures/rdf-xml/complete-works-of-william-shakespeare-without-living-dates.rdf'), { encoding: 'utf-8' });

const unknownWorks = fs.readFileSync(resolve('fixtures/rdf-xml/complete-works-of-unknown-author.rdf'), { encoding: 'utf-8' });

describe('lib/GutenbergDocument', () => {
    const completeWorksOfShakespeare = new GutenbergDocument(shakespeareWorks, 'application/rdf+xml');

    const completeWorksOfShakespeareWithoutLivingDates = new GutenbergDocument(shakespeareWorksWithoutLivingDates, 'application/rdf+xml');

    const completeWorksOfUnknown = new GutenbergDocument(unknownWorks, 'application/rdf+xml');

    const invalidDocument = new GutenbergDocument('invalid', 'application/rdf+xml');

    describe('getTitle', () => {
        test('returns a correct title of the rdf document', () => {
            expect(completeWorksOfShakespeare.getTitle()).toBe('The Complete Works of William Shakespeare')
        });

        test(`returns null if title has not been described`, () => {
            expect(completeWorksOfUnknown.getTitle()).toBe(null)
        });
    });

    describe('getUrl', () => {
        test('returns a correct url to the plain text of the book', () => {
            expect(completeWorksOfShakespeare.getUrl()).toBe('http://www.gutenberg.org/files/100/100-0.txt')
        });

        test(`returns null if title has not been described`, () => {
            expect(completeWorksOfUnknown.getUrl()).toBe(null)
        });
    });

    describe('getAuthors', () => {
        test('returns an array of authors if authors have been described', () => {
            const authors = completeWorksOfShakespeare.getAuthors();

            expect(authors).toBeInstanceOf(Array);

            expect(authors.length).toBe(1);
        });

        test('every element in the authors array is an author object', () => {
            const authors = completeWorksOfShakespeare.getAuthors();

            expect(authors).toEqual([
                {
                    name: 'Shakespeare, William',
                    birthdate: new Date('1564'),
                    deathdate: new Date('1616'),
                    aliases: [
                        'Shakspere, William',
                        'Shakspeare, William'
                    ],
                    webpage: 'http://en.wikipedia.org/wiki/William_Shakespeare'
                }
            ])
        });

        test(`returns an empty array if authors have not been described`, () => {
            const authors = completeWorksOfUnknown.getAuthors();

            expect(authors).toEqual([]);
        });

        test('returns name if it exists', () => {
            const [shakespeare] = completeWorksOfShakespeare.getAuthors();

            expect(shakespeare.name).toBe('Shakespeare, William');
        });

        test(`returns null-ish living dates if they haven't been described`, () => {
            const [shakespeare] = completeWorksOfShakespeareWithoutLivingDates.getAuthors();

            expect(shakespeare.birthdate).toBe(null);

            expect(shakespeare.deathdate).toBe(null);
        });

        test('returns multiple aliases if they exist', () => {
            const [shakespeare] = completeWorksOfShakespeare.getAuthors();

            expect(shakespeare.aliases).toEqual([
                'Shakspere, William',
                'Shakspeare, William'
            ]);
        });

        test('returns an empty array if the rdf document is invalid', () => {
            expect(invalidDocument.getAuthors()).toEqual([]);
        });
    });

    describe('getPayload', () => {
        test('returns all the information about the document', () => {
            expect(completeWorksOfShakespeare.getPayload()).toEqual({
                title: 'The Complete Works of William Shakespeare',
                authors: [
                    {
                        name: 'Shakespeare, William',
                        birthdate: new Date('1564'),
                        deathdate: new Date('1616'),
                        aliases: [
                            'Shakspere, William',
                            'Shakspeare, William'
                        ],
                        webpage: "http://en.wikipedia.org/wiki/William_Shakespeare"
                    }
                ],
                url: 'http://www.gutenberg.org/files/100/100-0.txt'
            })
        });
    });
});