import http from 'http';
import createLogger from 'hyped-logger';
import app from './app';
import config from './config';

const host = config.get('HOST');

const port = config.get('PORT');

const logger = createLogger();

export default {
  async start() {
    return new Promise(resolve => {
      const server = http.createServer(app.callback()).listen(port, host, () => {
        const { address, port: adressPort } = server.address() as any;

        const hostPort = `http://${address}:${adressPort}`;

        logger.info(`import service listens ${hostPort}`);

        if (process.send) {
          process.send('ready');
        }

        process.on('message', (msg: string) => {
          if (msg === 'shutdown') {
            logger.info('Closing all connections...');

            setTimeout(() => {
              logger.info('Finished closing connections');

              process.exit(0);
            }, 1500);
          }
        });

        process.on('SIGINT', () => {
          logger.info('SIGINT signal received.');

          server.close(async (err: Error) => {
            if (err) {
              logger.error(err);

              process.exit(1);
            }

            logger.info('Closing database connections...');

            process.exit(0);
          });
        });

        resolve();
      });
    })
  }
};
