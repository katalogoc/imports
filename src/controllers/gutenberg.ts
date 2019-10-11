
import { Context } from 'koa';
import { sync } from '../services/gutenberg';
import createError from 'http-errors';

export default {
  async start(ctx: Context) {
    try {
      await sync();

      ctx.status = 200;

      ctx.body = {ok: true, error: null}
    } catch (error) {
      throw createError(500, error);
    }
  }
};
