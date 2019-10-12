import * as dgraph from 'dgraph-js';
import grpc from 'grpc';
import config from '../config';

const clientStub = new dgraph.DgraphClientStub(
  `${config.get('DGRAPH_HOST')}:9080`,
  grpc.credentials.createInsecure(),
);
export default new dgraph.DgraphClient(clientStub);