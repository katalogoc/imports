import Router from 'koa-router';
import gutenberg from '../controllers/gutenberg';
import dbpedia from '../controllers/dbpedia';

const router = new Router()
    .get('/gutenberg/start', gutenberg.start)
    .get('/dbpedia/start', dbpedia.start);

export default router;
