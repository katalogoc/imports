export interface TextAPIInterface {
  getTextsAuthors(): Promise<any>;
}

export interface FetchOptions {
  limit: number;
  offset: number;
}
