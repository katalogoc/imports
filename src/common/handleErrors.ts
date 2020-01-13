import { Context } from 'koa';
import createError from 'http-errors';

export default async (ctx: Context, next: () => void) => {
  try {
    await next();
  } catch (err) {
    const status = err.statusCode || err.status || 500;

    ctx.status = status;

    ctx.body = {
      status,
      error: createError(status, err, {expose: true}),
    };
  }
};
