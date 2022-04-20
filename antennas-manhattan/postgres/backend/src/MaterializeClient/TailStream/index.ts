import { Readable } from "stream";
import { Client } from "pg";

/**
 * Thanks to Petros Angelatos
 * https://gist.github.com/petrosagg/804e5f009dee1cb8af688654ba396258
 * This class reads from a cursor in PostgreSQL
 */
export default class TailStream extends Readable {
  client: Client;

  cursorId: string;

  pendingReads: number;

  currentRows: Array<any>;

  BreakException = {};

  intervalId: NodeJS.Timer;

  runningQuery: boolean;

  constructor(client: Client, cursorId: string) {
    super({
      highWaterMark: 1000,
      objectMode: true,
    });
    this.client = client;
    this.cursorId = cursorId;
    this.pendingReads = 0;
    this.runningQuery = false;
  }

  /**
   * Readable method to fetch tail data
   * @param n
   */
  _read(n: number): void {
    if (this.pendingReads <= 0) {
      this.client
        .query(`FETCH ${n} ${this.cursorId} WITH (TIMEOUT='1s');`)
        .then(({ rows, rowCount }) => {
          if (rowCount === 0) {
            console.log("Empty results from tail. Staring interval read.");
            /**
             * Wait for data from the tail
             */
            this.intervalId = setInterval(() => this.intervalRead(n), 500);
          } else {
            /**
             * Process data
             */
            this.process(rows);
          }
        })
        .catch(this.catchClientErr);
    } else {
      /**
       * Process any additional rows
       */
      this.currentRows = this.currentRows.slice(
        this.currentRows.length - this.pendingReads,
        this.currentRows.length
      );
      try {
        this.currentRows.forEach((row) => {
          this.pendingReads -= 1;
          const backPressure = !this.push(row);
          if (backPressure) {
            throw this.BreakException;
          }
        });
      } catch (e) {
        if (e !== this.BreakException) throw e;
      }
    }
  }

  /**
   * Capture any error while fetching tail results
   * @param clientReasonErr
   */
  catchClientErr(clientReasonErr: any) {
    console.error("Error querying this cursor.");
    console.error(clientReasonErr);

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.destroy(clientReasonErr);
  }

  /**
   * Process and push rows
   * @param rows
   */
  process(rows: Array<any>): void {
    try {
      rows.forEach((row) => {
        this.pendingReads -= 1;
        const backPressure = !this.push(row);
        if (backPressure) {
          console.log("Oops. Backpressure.");
          throw this.BreakException;
        }
      });
    } catch (e) {
      if (e !== this.BreakException) throw e;
    }
  }

  /**
   * Interval fetching used when there are no results from the TAIL
   * Rather than pausing and waiting for results
   * Run a tail fetch every 500ms.
   * This is needed because if there is no update from the tail the pipe will close.
   * Another alternative is to send dummy data but this could end up filtering data all the time.
   * Another alternative is to push whenever is available rather than "poll" but how backpressure is handled?
   * @param n
   */
  intervalRead(n: number): void {
    if (this.runningQuery === false) {
      if (this.destroyed) {
        clearInterval(this.intervalId);
        return;
      }

      this.runningQuery = true;
      this.client
        .query(`FETCH ${n} ${this.cursorId} WITH (TIMEOUT='1s');`)
        .then(({ rows, rowCount }) => {
          if (rowCount > 0) {
            this.process(rows);
            clearInterval(this.intervalId);
            console.log("New results from the tail. Finishing interval read.");
          } else {
            console.log("Nothing from interval read.");
          }
        })
        .catch(this.catchClientErr)
        .finally(() => {
          this.runningQuery = false;
        });
    }
  }
}
