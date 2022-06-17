'use strict';

const CacheFunc = require('../CacheFunc');
const assert = require('assert').strict;

const fib = (n) => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2));

const speedTest = () => {
  const tmp = [];
  const LOOP_COUNT = 10000;
  const fibArg = 25;
  const cachedFib = new CacheFunc(fib, 4000, 3);
  let start = new Date().getTime();
  for (let i = 0; i < LOOP_COUNT; i++) {
    tmp.push(fib(fibArg));
  }
  let end = new Date().getTime();
  const time1 = end - start;

  tmp.splice(0, tmp.length);

  start = new Date().getTime();
  for (let i = 0; i < LOOP_COUNT; i++) {
    tmp.push(cachedFib.calculate(fibArg));
  }
  end = new Date().getTime();
  const time2 = end - start;

  if (time1 <= time2) throw new Error('Speed test failed');
};

const priorityTest = () => {
  const cachedFib = new CacheFunc(fib, 4000, 3);

  const args1 = [35, 30, 25, 40];
  const args2 = [35, 30, 40];
  const fibResults = [];
  const cacheResults = [];

  for (let i = 0; i < args1.length; i++) {
    cachedFib.calculate(args1[i]);
  }

  for (let i = 0; i < args2.length; i++) {
    fibResults.push(fib(args2[i]));
  }

  for (const val of cachedFib.cache.values()) cacheResults.push(val);
  console.log(fibResults);
  console.log(cacheResults);
  assert.deepEqual(fibResults, cacheResults, 'Priority test failed');
};

const timeInCache = () => {
  const cachedFib = new CacheFunc(fib, 2000, 3);

  const args = [20, 15, 10];

  for (let i = 0; i < args.length; i++) {
    cachedFib.calculate(args[i]);
  }

  const sleep = (msec) =>
    new Promise((resolve) => {
      setTimeout(resolve, msec);
    });

  (async () => {
    await sleep(2000);
    assert.strictEqual(cachedFib.cache.size, 0, 'Time in cache failed');
  })();
};

const setFn = () => {
  const cachedFib = new CacheFunc(fib, 2000, 3);
  const args = [20, 15, 10];

  const test = (val) => val++;

  for (let i = 0; i < args.length; i++) {
    cachedFib.calculate(args[i]);
  }

  cachedFib.fn = test;
  assert.strictEqual(cachedFib.cache.size, 0, 'Method Set fn failed');
};

const timeoutTest = () => {
  const cachedFib = new CacheFunc(fib, 2000, 3);
  const args = [20, 15, 10];

  for (let i = 0; i < args.length; i++) {
    cachedFib.calculate(args[i]);
  }

  assert.strictEqual(cachedFib.timeouts.size, 3, 'Timeout size exceeded');

  const sleep = (msec) =>
    new Promise((resolve) => {
      setTimeout(resolve, msec);
    });

  (async () => {
    await sleep(2000);
    assert.strictEqual(cachedFib.timeouts.size, 0, 'Timeouts size not empty');
  })();
};

const sizeTest = () => {
  const cachedFib = new CacheFunc(fib, 2000, 3);
  const args = [20, 15, 10];

  for (let i = 0; i < args.length; i++) {
    cachedFib.calculate(args[i]);
  }
  cachedFib.length = 1;

  assert.strictEqual(cachedFib.cache.size, 1, 'Length setter failed');
};

const tests = [
  speedTest,
  priorityTest,
  timeInCache,
  setFn,
  timeoutTest,
  sizeTest,
];

for (const test of tests) {
  try {
    test();
  } catch (err) {
    console.log(err);
  }
}
