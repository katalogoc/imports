import amqplib from 'amqplib';
import config from '../config';
import createLogger from 'hyped-logger';

const logger = createLogger();

const connect = async () => {
  const hostname = config.get('AMQP_HOST');

  const username = config.get('RABBITMQ_DEFAULT_USER');

  const password = config.get('RABBITMQ_DEFAULT_PASS');

  let connection = null;

  try {
    connection = await amqplib.connect({ hostname, username, password });

    logger.info(`Connected to AMQP at ${hostname}`);
  } catch (error) {
    logger.error(`Coundn't connect to AMQP at ${hostname}`);

    throw error;
  }

  try {
    const channel = await connection.createChannel();

    const q = 'task_queue';

    await channel.assertQueue(q, { durable: true });

    return {
      enqueue: (msg: string) => {
        channel.sendToQueue(q, Buffer.from(msg));
      },
      close: () => {
        channel.close();
      },
    };
  } catch (error) {
    logger.error(`Error during enqueuing, ${error}`);

    throw error;
  }
};

export default {
  async enqueue(msg: any) {
    const { enqueue, close } = await connect();

    try {
      await enqueue(JSON.stringify(msg));
    } catch (error) {
      logger.error(`Error during enqueuing, ${error}`);

      throw error;
    } finally {
      await close();
    }
  },
};
