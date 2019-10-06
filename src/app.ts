import Koa from 'koa';
import loggerWinston from 'koa-logger-winston';
import bodyParser from 'koa-bodyparser';
import createLogger from 'hyped-logger';
import handleErrors from './middlewares/handleErrors';
import router from './routes';

const logger = createLogger();

const app = new Koa()
  .use(handleErrors)
  .use(loggerWinston(logger))
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .on('error', (err: Error) => {
    logger.error(err);
  });


export default app;