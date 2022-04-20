import { Writable } from "stream";

/**
 * This class is in charge of writing every chunk (array of rows)
 * into a redis instance to send to all the users.
 */
export default class WriteStream extends Writable {
  listener: (results: Array<any>) => void;

  constructor(listener: (results: Array<any>) => void) {
    super({
      highWaterMark: 1000,
      objectMode: true,
    });

    this.listener = listener;
  }

  _write(
    rows: Array<any>,
    encoding: BufferEncoding,
    callback: (error?: Error) => void
  ): void {
    if (rows && rows.length > 0) {
      this.listener(rows);
    }

    callback();
  }
}
