import {Pool, QueryResult, Client as PgClient, PoolConfig} from 'pg';
import EventEmitter from 'events';
import SubscribeStream from './SubscribeStream';
import TransformStream from './TransformStream';
import WriteStream from './WriteStream';

/**
 * Custom Materialize Client created for Demo purposes
 */
export default class MaterializeClient {
  pool: Pool | undefined;
  config: PoolConfig;

  constructor(config: PoolConfig) {
    this.config = config;
    this.pool = new Pool(config);
  }

  /**
   * Run a query in Materialize
   * @param statement
   * @returns
   */
  query(statement: string): Promise<QueryResult> {
    const queryPromise = new Promise<QueryResult>((res, rej) => {
      this.pool.connect(async (connectErr, poolClient, release) => {
        try {
          /**
           * Check errors in connection
           */
          if (connectErr) {
            console.error(`Error connecting pool to run query.`);
            rej(connectErr);
            return;
          }

          /**
           * Control pool error listeners
           */
          if (poolClient.listenerCount('error') === 0) {
            poolClient.on('error', (clientErr) => {
              console.error(`Client err: ${clientErr}`);
              rej(new Error('Error running query.'));
            });
          }

          /**
           * Run query
           */
          const response = await poolClient.query(statement);
          res(response);
        } catch (e) {
          console.error('Error running query.');
          console.error(e);
          rej(e);
        } finally {
          try {
            /**
             * After we stop/destroy a client release function dissapears.
             */
            if (release) {
              release();
            }
          } catch (e) {
            console.error(e);
            console.error('Error realeasing client.');
          }
        }
      });
    });

    return queryPromise;
  }

  /**
   * Run a subscribe in Materialize
   * @param statement
   * @param eventEmmiter
   * @returns
   */
  async subscribe(statement: string, eventEmmiter: EventEmitter): Promise<void> {
    return new Promise((res, rej) => {
      const asyncStream = async () => {
        /**
         * Create a single client per subscribe rather than re-using a pool's client
         */
        const singleClient = new PgClient(this.config);

        /**
         * Client ending handler
         */
        let clientEnded = false;
        const endClient = () => {
          console.log('Ending client.');
          if (clientEnded === false) {
            clientEnded = true;
            singleClient.end((err) => {
              if (err) {
                console.error('Error ending client.');
                console.debug(err);
              }
            });
          }
        };

        try {
          singleClient.on('error', (clientErr) => {
            console.error(`Client err: ${clientErr}`);
            rej(clientErr);
          });

          singleClient.on('end', () => {
            console.log('Client end.');
            res();
          });

          await singleClient.connect();
          await singleClient.query(
            `BEGIN; DECLARE mz_cursor CURSOR FOR ${statement} WITH (SNAPSHOT, PROGRESS);`
          );

          /**
           * Listen to subscribe data updates
           */
          const listener = (results: Array<any>) => {
            eventEmmiter.emit('data', results);
          };

          /**
           * Listen to subscribe errors
           */
          const handleSubscribeError = (err) => {
            console.error('Error inside subscribe: ', err);
            rej(err);
          };

          const subscribeStream = new SubscribeStream(singleClient, 'mz_cursor');
          subscribeStream.on('error', handleSubscribeError);

          const transfromStream = new TransformStream();
          const writeStream = new WriteStream(listener);

          /**
           * Listen to disconnects from the client
           */
          eventEmmiter.on('disconnect', () => {
            if (subscribeStream.destroyed === false) {
              subscribeStream.destroy();
            }
            endClient();
          });

          /**
           * Listen to pipe closing due to success or failure
           */
          const streamPipe = subscribeStream.pipe(transfromStream).pipe(writeStream);
          streamPipe.on('close', () => {
            console.log('Pipe closed');
            endClient();
            res();
          });
        } catch (clientError) {
          endClient();
          rej(clientError);
        }
      };

      asyncStream().catch((asyncErr) => {
        console.error('Error inside async stream.');
        console.error(asyncErr);
        rej(asyncErr);
      });
    });
  }
}