export interface GutenbergAuthor {
    name: string;
    webpage: string;
    alias: string[];
    birthdate: Date;
    deathdate: Date;
    thumbnail: string;
}

export interface GutenbergText {
    title: string;
    url: string;
    authors: GutenbergAuthor[];
}
