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
      console.log(this.#priority);
      let min = this.#priority.keys().next().value;
      for (const size of this.#priority.keys()) if (size < min) min = size;

      const key = this.#priority.get(min);
      this.cache.delete(key);

      this.#priority.delete(min);
      this.#size -= min;
    }
  }

  #checkCacheSize(fileSize) {
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

const test = new CacheFile(fs['readFile'], 5000, 10);

test.readFile('CacheFunc.js', 'UTF8', (err, data) => {
  if (err) console.log(err);

  test.readFile('CacheFile.js', 'UTF8', (err, data) => {
    if (err) console.log(err);
    console.log(test.cache);
    test.maxSize = 3;
    console.log(test.cache);
  });
});

/*
console.log(fs.statSync('CacheFile.js', 'UTF8').size);
console.log(fs.statSync('CacheFunc.js', 'UTF8').size);
*/
module.exports = CacheFile;
