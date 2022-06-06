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

const speedTest = (fn, cachedFn, args) => {
  const tmp = [];
  const LOOP_COUNT = 10000;
  let start = new Date().getTime();
  for (let i = 0; i < LOOP_COUNT; i++) {
    tmp.push(fn(...args));
  }
  let end = new Date().getTime();
  let time = end - start;
  console.log(`Time of simple function: ${time} ;`);

  tmp.splice(0, tmp.length);

  start = new Date().getTime();
  for (let i = 0; i < LOOP_COUNT; i++) {
    tmp.push(cachedFn.calculate(...args));
  }
  end = new Date().getTime();
  time = end - start;
  console.log(`Time of cached function: ${time} ;`);
};

const fib = (n) => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2));
const cachedFib = new Cache(fib);

speedTest(fib, cachedFib, [25]);
