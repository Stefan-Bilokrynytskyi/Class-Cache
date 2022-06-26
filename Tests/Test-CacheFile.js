'use strict';

const CacheFile = require('../CacheFile');
const fs = require('fs');
const assert = require('assert').strict;

const speedTest = () => {
  const cachedFS = new CacheFile(fs['readFile'], 2000, 10000);
  const LOOP_COUNT = 10000;

  const readfile1 = async (filename, encoding) =>
    new Promise((resolve, reject) =>
      fs.readFile(filename, encoding, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      })
    );

  const readfile2 = async (filename, encoding) =>
    new Promise((resolve, reject) =>
      cachedFS.readFile(filename, encoding, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      })
    );
  (async () => {
    let start = new Date().getTime();
    for (let i = 0; i < LOOP_COUNT; i++) {
      await readfile1('Test.txt', 'utf8');
    }
    let end = new Date().getTime();

    const time1 = end - start;
    console.log('Time fs:' + time1);

    start = new Date().getTime();
    for (let i = 0; i < LOOP_COUNT; i++) {
      await readfile2('Test.txt', 'utf8');
    }
    end = new Date().getTime();

    const time2 = end - start;
    console.log('Time cachedFS:' + time2);
    if (time1 <= time2) throw new Error('Speed test failed');
  })();
};

const maxSizeTest = () => {
  const cachedFS = new CacheFile(fs['readFile'], 2000, 10);

  cachedFS.readFile('Test-CacheFunc.js', 'utf8', (err, data) => {
    if (err) console.log(err);

    cachedFS.readFile('Test-CacheFile.js', 'utf8', (err, data) => {
      if (err) console.log(err);
      console.log(cachedFS.size);
      cachedFS.maxSize = 5;

      console.log(cachedFS.cache);
      assert.strictEqual(cachedFS.cache.size, 1, 'Cache is not empty');
    });
  });
};

const clearTest = () => {
  const cachedFS = new CacheFile(fs['readFile'], 2000, 10000);

  const readfile = async (filename, encoding) =>
    new Promise((resolve, reject) =>
      cachedFS.readFile(filename, encoding, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      })
    );

  (async () => {
    await readfile('Test.txt', 'utf8');
    await readfile('../CacheFile.js', 'utf8');
    cachedFS.clear();
    console.log('I am here');
    assert.strictEqual(cachedFS.cache.size, 0, 'Cache is not empty');
  })();
};

const checkTimeIncache = () => {
  const cachedFS = new CacheFile(fs['readFile'], 2000, 100);

  cachedFS.readFile('Test-CacheFile.js', 'utf8', (err, data) => {
    if (err) console.log(err);

    const sleep = (msec) =>
      new Promise((resolve) => {
        setTimeout(resolve, msec);
      });

    (async () => {
      await sleep(2000);
      assert.strictEqual(cachedFS.cache.size, 0, 'Cache is not empty');
    })();
  });
};

const tests = [checkTimeIncache, clearTest, maxSizeTest, speedTest];

for (const test of tests) {
  try {
    test();
  } catch (err) {
    console.log(err);
  }
}
