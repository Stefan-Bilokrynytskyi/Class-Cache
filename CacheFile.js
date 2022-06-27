'use strict';

const fs = require('fs');
const crypto = require('crypto');

class CacheFile {
  #priority;
  #timeouts;
  #maxSize;
  #size;
  constructor(fn, time, maxSize) {
    this.cache = new Map();
    this.#maxSize = maxSize;
    this.#size = 0;
    this.#priority = new Map();
    this.time = time;
    this.#timeouts = new Map();
    CacheFile.prototype[fn.name] = this.#createMethod(fn);
  }

  get size() {
    return this.#size;
  }

  get priority() {
    return this.#priority;
  }

  clear() {
    this.cache.clear();
    this.#size = 0;
    this.#priority.clear();
    for (const timeout of this.#timeouts.values()) clearTimeout(timeout);
    this.#timeouts.clear();
  }

  addMethod(fn) {
    CacheFile.prototype[fn.name] = this.#createMethod(fn);
  }

  set maxSize(maxSize) {
    this.#maxSize = maxSize;
    while (this.#size > this.#maxSize) {
      let min = this.#priority.keys().next().value;
      for (const size of this.#priority.keys()) if (size < min) min = size;

      const key = this.#priority.get(min);
      this.cache.delete(key);
      clearTimeout(this.#timeouts.get(key));
      this.#timeouts.delete(key);
      this.#priority.delete(min);
      this.#size -= min;
    }
  }

  #generateKey(args, fnName) {
    let key = '';
    for (let i = 0; i < args.length; i++) {
      key += JSON.stringify(args[i]) + ':' + typeof args[i] + '-';
    }
    key += fnName;

    key = crypto.createHash('sha256').update(key).digest('hex');

    return key;
  }

  #timeInCache(key, fileSize) {
    this.#timeouts.set(
      key,
      setTimeout(() => {
        this.#size -= fileSize;
        this.cache.delete(key);
        this.#priority.delete(fileSize);
        this.#timeouts.delete(key);
      }, this.time)
    );
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
    clearTimeout(this.#timeouts.get(key));
    this.#timeouts.delete(key);
    this.#checkCacheSize(fileSize);
  }

  #createMethod(fn) {
    return (...args) => {
      const INC = 1024;
      const path = args[0];
      const cb = args.pop();
      const key = this.#generateKey(args, fn.name);
      const record = this.cache.get(key);

      if (record) {
        cb(record.err, record.data);
        return;
      }

      const fileSize = fs.statSync(path).size / INC;
      //console.log(fileSize);
      try {
        this.#checkCacheSize(fileSize);
      } catch (err) {
        console.log(err);
        return;
      }

      this.#priority.set(fileSize, key);
      fn(...args, (err, data) => {
        this.cache.set(key, { err, data });

        cb(err, data);
      });
      this.#timeInCache(key, fileSize);
    };
  }
}

module.exports = CacheFile;
