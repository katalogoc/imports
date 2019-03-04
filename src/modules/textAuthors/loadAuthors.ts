import { TextAPIInterface } from './types';

export async function* load(textAPI: TextAPIInterface): AsyncIterableIterator<any> {
  console.log(textAPI);
}
