import { Transform } from "stream";

interface Antenna {
  antenna_id: string;
  geojson: string;
  performance: number;
}

/**
 * This class creates a batch of chunks. In this way every chunk is not a row but an array of rows.
 * This will improve the performance of the writing.
 * A timeout is needed in case the batch length is lower than the highwatermark for a long period of time.
 */
export default class TransformStream extends Transform {
  batch = new Array<Antenna>();

  size: number;

  constructor() {
    super({
      highWaterMark: 100,
      objectMode: true,
    });

    this.cleanBatch();
  }

  cleanBatch() {
    this.batch = new Array<Antenna>();
  }

  _transform(row: any, encoding: string, callback: () => void) {
    const { mz_progressed: mzProgressed } = row;

    if (mzProgressed) {
      this.push(this.batch);
      this.cleanBatch();
    } else {
      this.batch.push(row);
    }
    callback();
  }

  _flush(callback: () => void) {
    if (this.batch.length) {
      this.push(this.batch);
      this.cleanBatch();
    }
    callback();
  }
}
