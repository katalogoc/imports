import Router from 'koa-router';
import controller from './controller';

const router = new Router()
    .get('/gutenberg/start', controller.start);

export default router;
