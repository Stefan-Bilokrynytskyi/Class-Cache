'use strict';

class CacheFunc {
  constructor(fn, time, length = 10) {
    this.fn = fn;
    this.cache = new Map();
    this.length = length;
    this.priorityQueue = new Map();
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
      this.priorityQueue.delete(leadTime);
    }, this.time);
  }

  #checkCacheSize() {
    if (this.cache.size < this.length) return;

    let min = this.priorityQueue.keys().next().value;
    for (const time of this.priorityQueue.keys()) if (time < min) min = time;

    const key = this.priorityQueue.get(min);
    this.cache.delete(key);
    this.priorityQueue.delete(min);
  }

  calculate(...args) {
    const key = args.map(this.#generateKey).join('|');

    if (this.cache.has(key)) {
      // console.log('From Cache:');
      return this.cache.get(key);
    }

    // console.log('Calculate:');
    const begin = process.hrtime.bigint();
    const value = this.fn(...args);
    const end = process.hrtime.bigint();
    const leadTime = end - begin;

    this.#checkCacheSize();
    this.cache.set(key, value);
    this.priorityQueue.set(leadTime, key);
    this.#timeInCache(key, leadTime);
    return value;
  }
}

// Usage

/*
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
*/

const fib = (n) => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2));
const cachedFib = new CacheFunc(fib, 4000, 3);

const sleep = (msec) =>
  new Promise((resolve) => {
    setTimeout(resolve, msec);
  });

cachedFib.calculate(20);
cachedFib.calculate(21);
cachedFib.calculate(22);
cachedFib.showCache();

(async () => {
  await sleep(4000);
  cachedFib.showCache();
})();

// speedTest(fib, cachedFib, [25]);
