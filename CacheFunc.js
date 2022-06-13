'use strict';

const crypto = require('crypto');

class CacheFunc {
  #fn;
  constructor(fn, time, length = 10) {
    this.#fn = fn;
    this.cache = new Map();
    this.length = length;
    this.priority = new Map();
    this.time = time;
  }

  #generateKey(arg) {
    const type = typeof arg;
    if (type === 'object') {
      for (let field in arg) {
        if (typeof field === 'symbol') field = field.toString();
        arg[field] = this.#generateKey(arg[field]);
      }

      return JSON.stringify(arg) + ':' + type;
    } else if (type === 'symbol' || type === 'bigint' || type === 'function') {
      return arg.toString() + ':' + type;
    } else return JSON.stringify(arg) + ':' + type;
  }

  #keyToHash(key) {
    key = crypto.createHash('sha256').update(key).digest('hex');
    return key;
  }

  #timeInCache(key, leadTime) {
    setTimeout(() => {
      this.cache.delete(key);
      this.priority.delete(leadTime);
    }, this.time);
  }

  #checkCacheSize() {
    if (this.cache.size < this.length) return;

    let min = this.priority.keys().next().value;
    for (const time of this.priority.keys()) if (time < min) min = time;

    const key = this.priority.get(min);
    this.cache.delete(key);
    this.priority.delete(min);
  }

  calculate(...args) {
    let key = args.map(this.#generateKey).join('|');
    key = this.#keyToHash(key);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const begin = process.hrtime.bigint();
    const value = this.#fn(...args);
    const end = process.hrtime.bigint();
    const leadTime = end - begin;

    this.#checkCacheSize();
    this.cache.set(key, value);
    this.priority.set(leadTime, key);
    this.#timeInCache(key, leadTime);
    return value;
  }
}

module.exports = CacheFunc;
