'use strict';

const fs = require('fs');

const INC = 1024;

class CacheFile {
  #priority;
  constructor(fn, time, maxSize) {
    this.fn = fn;
    this.cache = new Map();
    this.maxSize = maxSize;
    this.size = 0;
    this.#priority = new Map();
    this.time = time;
    CacheFile.prototype[fn.name] = this.createMethod(fn);
  }

  #checkCacheSize(fileSize) {
    if (this.size + fileSize < this.maxSize) {
      this.size += fileSize;
      return;
    }

    let min = this.#priority.keys().next().value;
    for (const time of this.#priority.keys()) if (time < min) min = time;

    const key = this.#priority.get(min);
    this.cache.delete(key);

    this.#priority.delete(min);
    this.size -= min;
    this.#checkCacheSize(fileSize);
  }

  createMethod(fn) {
    return (...args) => {
      const cb = args.pop();
      const key = args[0];
      const record = this.cache.get(key);
      const fileSize = fs.statSync(...args).size;
      this.#checkCacheSize(fileSize / INC);
      this.#priority.set(fileSize, key);

      if (record) {
        console.log('from cache');
        cb(record.err, record.data);
        return;
      }
      fn(...args, (err, data) => {
        this.cache.set(key, { err, data });

        cb(err, data);
      });
    };
  }
}

module.exports = CacheFile;
