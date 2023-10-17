class State {
    #state;
    #timestamp;
    #valid;
    #history;

    constructor(collectHistory) {
      this.#state = new Map();
      this.#timestamp = 0;
      this.#valid = true;
      if (collectHistory) {
        this.#history = [];
      }
    }

    getState() {
      const list = new Array();

      Array.from(this.#state.entries()).forEach(([key, value]) => {
        const clone = JSON.parse(key);
        let i = 0;
        while (i< value) {
          list.push(clone);
          i++;
        };
      });

      return list;
    }

    getHistory() {
      return this.#history;
    }

    #validate(timestamp) {
      if (!this.#valid) {
        throw new Error("Invalid state.");
      } else if (timestamp < this.#timestamp) {
        console.error("Invalid timestamp.");
        this.#valid = false;
        throw new Error(
          `Update with timestamp (${timestamp}) is lower than the last timestamp (${
            this.#timestamp
          }). Invalid state.`
        );
      }
    }

    #process({ value: _value, diff }) {
      // Count value starts as a NaN
      const value = JSON.stringify(_value);
      const count = this.#state.has(value) ? (this.#state.get(value) + diff) : diff;

      if (count <= 0) {
        this.#state.delete(value);
      } else {
        this.#state.set(value, count);
      }


      if (this.#history) {
        this.#history.push({ value: _value, diff });
      }
    }

    update(updates, timestamp) {
      if (updates.length > 0) {
        this.#validate(timestamp);
        this.#timestamp = timestamp;
        updates.forEach(this.#process.bind(this));
      }
    }
  };

  module.exports = State;