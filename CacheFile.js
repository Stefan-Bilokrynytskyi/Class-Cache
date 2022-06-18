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
    for (const size of this.#priority.keys()) if (size < min) min = size;

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

      if (record) {
        console.log('from cache');
        cb(record.err, record.data);
        return;
      }
      const fileSize = fs.statSync(...args).size / INC;
      this.#checkCacheSize(fileSize);
      this.#priority.set(fileSize, key);
      fn(...args, (err, data) => {
        console.log('First reading');
        this.cache.set(key, { err, data });

        cb(err, data);
      });
    };
  }
}

const test = new CacheFile(fs['readFile'], 5000, 3);

test.readFile('CacheFunc.js', 'UTF8', (err, data) => {
  if (err) console.log(err);
  console.log(test.cache);
  test.readFile('CacheFile.js', 'UTF8', (err, data) => {
    console.log(test.cache);
    if (err) console.log(err);
  });
});

module.exports = CacheFile;
