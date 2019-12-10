import * as fsUtil from '../fs';
import { resolve } from 'path';

describe('util/fs', () => {
    describe('traverse', () => {
        test('is an async function', () => {
            expect(fsUtil.traverse(resolve('.'))).toBeInstanceOf(Promise);
        });

        test('returns an array of absolute file pathes', async () => {
            const files = await fsUtil.traverse(resolve('fixtures'));

            expect(files.sort()).toEqual([
                resolve('fixtures', 'rdf-xml', 'complete-works-of-unknown-author.rdf'),
                resolve('fixtures', 'rdf-xml', 'complete-works-of-william-shakespeare-without-living-dates.rdf'),
                resolve('fixtures', 'rdf-xml', 'complete-works-of-william-shakespeare.rdf')
            ]);
        });
    });
});