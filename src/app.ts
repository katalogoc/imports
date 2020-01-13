import Koa from 'koa';
import loggerWinston from 'koa-logger-winston';
import bodyParser from 'koa-bodyparser';
import createLogger from 'hyped-logger';
import handleErrors from './common/handleErrors';
import gutenbergRouter from './gutenberg/router';

const logger = createLogger();

const app = new Koa()
  .use(loggerWinston(logger))
  .use(handleErrors)
  .use(bodyParser())
  .use(gutenbergRouter.routes())
  .use(gutenbergRouter.allowedMethods())
  .on('error', (err: Error) => {
    logger.error(err);
  });

export default app;
