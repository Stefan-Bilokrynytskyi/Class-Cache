'use strict';

class CacheFunc {
  #fn;
  constructor(fn, time, length = 10) {
    this.#fn = fn;
    this.cache = new Map();
    this.length = length;
    this.priority = new Map();
    this.time = time;
  }

  showCache() {
    if (this.cache.size === 0) console.log('Cache is empty');
    for (const val of this.cache.values()) console.log(val);
  }

  #generateKey(arg) {
    if (typeof arg === 'object') {
      for (const field in arg) {
        if (typeof arg[field] === 'function') {
          arg[field] = arg[field].toString();
        }
      }
    }
    return JSON.stringify(arg) + ':' + typeof arg;
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
    const key = args.map(this.#generateKey).join('|');

    if (this.cache.has(key)) {
      // console.log('From Cache:');
      return this.cache.get(key);
    }

    // console.log('Calculate:');
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
//const a = { a: 3, b: [12] };
console.log(typeof Symbol('name').toString());

module.exports = CacheFunc;
