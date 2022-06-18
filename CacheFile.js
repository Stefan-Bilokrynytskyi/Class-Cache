'use strict';

const fs = require('fs');

const INC = 1024;

class CacheFile {
  #priority;
  #timeouts;
  #maxSize;
  #size;
  constructor(fn, time, maxSize) {
    this.fn = fn;
    this.cache = new Map();
    this.#maxSize = maxSize;
    this.#size = 0;
    this.#priority = new Map();
    this.time = time;
    this.#timeouts = new Map();
    CacheFile.prototype[fn.name] = this.createMethod(fn);
  }

  set maxSize(maxSize) {
    this.#maxSize = maxSize;
    while (this.#size > this.#maxSize) {
      let min = this.#priority.keys().next().value;
      for (const size of this.#priority.keys()) if (size < min) min = size;

      const key = this.#priority.get(min);
      this.cache.delete(key);

      this.#priority.delete(min);
      this.#size -= min;
    }
  }

  #checkCacheSize(fileSize) {
    if (fileSize > this.#maxSize) {
      throw new Error('File size exceeded cache size');
    }
    if (this.#size + fileSize < this.#maxSize) {
      this.#size += fileSize;
      return;
    }

    let min = this.#priority.keys().next().value;
    for (const size of this.#priority.keys()) if (size < min) min = size;

    const key = this.#priority.get(min);
    this.cache.delete(key);

    this.#priority.delete(min);
    this.#size -= min;
    this.#checkCacheSize(fileSize);
  }

  createMethod(fn) {
    return (...args) => {
      const cb = args.pop();
      const key = args[0];
      const record = this.cache.get(key);

      if (record) {
        console.log('from cache');
        cb(record.err, record.data);
        return;
      }

      const fileSize = fs.statSync(...args).size / INC;
      try {
        this.#checkCacheSize(fileSize);
      } catch (err) {
        console.log(err);
        return;
      }

      this.#priority.set(fileSize, key);
      fn(...args, (err, data) => {
        console.log('First reading');
        this.cache.set(key, { err, data });

        cb(err, data);
      });
    };
  }
}

const test = new CacheFile(fs['readFile'], 5000, 2);

test.readFile('CacheFunc.js', 'UTF8', (err, data) => {
  if (err) console.log(err);
  else console.log(data.toString());
  test.readFile('CacheFunc.js', 'UTF8', (err, data) => {
    if (err) console.log(err);
    else console.log(data.toString());
  });
});
module.exports = CacheFile;
