
import { Context, Middleware } from 'koa';
import gutenbergService from '../services/gutenberg';
import createError from 'http-errors';

export default {
  async start(ctx: Context) {
    try {
      await gutenbergService.sync();

      ctx.status = 200;

      ctx.body = {ok: true, error: null}
    } catch (error) {
      throw createError(500, error);
    }
  }
};
