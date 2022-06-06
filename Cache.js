'use strict';

class Cache {
  constructor(fn) {
    this.fn = fn;
    this.cache = new Map();
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

  calculate(...args) {
    const key = args.map(this.#generateKey).join('|');

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const value = this.fn(...args);
    this.cache.set(key, value);

    return value;
  }
}
