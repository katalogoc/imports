export interface GutenbergAuthor {
    name: string;
    aliases: string[];
    birthdate: Date;
    deathdate: Date;
}

export interface GutenbergText {
    title: string;
    url: string;
    authors: GutenbergAuthor[];
}
