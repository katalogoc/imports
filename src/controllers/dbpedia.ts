import { Context } from 'koa';
import dbpediaService from '../services/dbpedia';
import createError from 'http-errors'

export default {
  async start(ctx: Context, next: Function) {
    try {
      await dbpediaService.sync();

      ctx.status = 200;

      ctx.body = {ok: true, error: null}
    } catch (error) {
      throw createError(501, error);
    }
  }
};
