import { sparql } from './../util';
import { SparqlClient } from '../types';

export default (client: SparqlClient) => {
  const query = (q: string) => sparql(client, q);

  return {
    async getAuthorWikiLinks() {
      return query(`
        PREFIX dc: <http://purl.org/dc/terms/>
        PREFIX pg: <http://www.gutenberg.org/2009/pgterms/>

        SELECT DISTINCT ?webpage
        WHERE {
          ?text dc:creator/pg:webpage ?webpage
        }
      `)
    },
    async getTextsAuthors() {
      return query(`
        PREFIX dc: <http://purl.org/dc/terms/>
        PREFIX pg: <http://www.gutenberg.org/2009/pgterms/>
        PREFIX gb: <http://www.gutenberg.org/2009/>

        SELECT *
        WHERE {
          ?subject dc:creator/pg:name ?name;
                  dc:creator/pg:alias ?alias;
                  dc:creator/pg:deathdate ?deathdate;
                  dc:creator/pg:birthdate ?birthdate;
                  dc:creator/pg:webpage ?webpage
        }
      `);
    },
    async getDbPediaEntityByWikiLink(topic: string) {
      return query(`
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dc: <http://purl.org/dc/terms/>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>

        SELECT *
        WHERE {
          OPTIONAL {
            <${topic}> foaf:primaryTopic ?resource .
            OPTIONAL { ?resource foaf:gender ?gender . }
            OPTIONAL { ?resource foaf:name ?name . }
            OPTIONAL { ?resource dbo:era ?era . }
            OPTIONAL { ?resource dbo:deathPlace ?deathPlace . }
            OPTIONAL { ?resource dbo:deathDate ?deathDate . }
            OPTIONAL { ?resource dbo:birthPlace ?birthPlace . }
            OPTIONAL { ?resource dbo:birthDate ?birthDate . }
            OPTIONAL { ?resource dbo:wikiPageExternalLink ?wikiPageExternalLink . }
            OPTIONAL { ?resource dbo:thumbnail ?thumbnail . }
            OPTIONAL { ?resource dbo:abstract ?abstract . }
            OPTIONAL { ?resource dbo:influenced ?influenced . }
            OPTIONAL { ?resource dbo:influencedBy ?influencedBy . }
            OPTIONAL { ?resource dbo:mainInterest ?mainInterest . }
            OPTIONAL { ?resource dbo:notableIdea ?notableIdea . }
            OPTIONAL { ?resource dbo:philosophicalSchool ?philosophicalSchool . }
            OPTIONAL { ?resource dbo:almaMater ?almaMater . }
            OPTIONAL { ?resource dbo:region ?region . }
            OPTIONAL { ?resource dbo:nationality ?nationality . }
            OPTIONAL { ?resource foaf:depiction ?depiction . }
            OPTIONAL { ?resource foaf:givenName ?givenName . }
          }
        }
    `);
    },
  };
};
