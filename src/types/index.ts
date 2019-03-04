export type Author = any;

export type SparqlClient = any;

export interface HashMap<T> {
  [key: string]: T;
}

export interface SparqlLiteral {
  type: string;
  value: string;
}

export type SparqlBinding = HashMap<SparqlLiteral>;
