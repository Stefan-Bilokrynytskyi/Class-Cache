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
      await readfile1('Class-Cache/Tests/Test.txt', 'utf8');
    }
    let end = new Date().getTime();

    const time1 = end - start;
    console.log('Time fs:' + time1);

    start = new Date().getTime();
    for (let i = 0; i < LOOP_COUNT; i++) {
      await readfile2('Class-Cache/Tests/Test.txt', 'utf8');
    }
    end = new Date().getTime();

    const time2 = end - start;
    console.log('Time cachedFS:' + time2);
    if (time1 <= time2) throw new Error('Speed test failed');
  })();
};

const maxSizeTest = () => {
  const cachedFS = new CacheFile(fs['readFile'], 2000, 10);

  cachedFS.readFile('Class-Cache/Tests/Test-CacheFunc.js', 'utf8', (err, data) => {
    if (err) console.log(err);

    cachedFS.readFile('Class-Cache/Tests/Test-CacheFile.js', 'utf8', (err, data) => {
      if (err) console.log(err);
      console.log(cachedFS.size);
      cachedFS.maxSize = 5;

      console.log(cachedFS.cache);
      assert.strictEqual(cachedFS.cache.size, 1, 'Max size failed');
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
    await readfile('Class-Cache/Tests/Test.txt', 'utf8');
    await readfile('Class-Cache/CacheFile.js', 'utf8');
    cachedFS.clear();
    console.log('I am here');
    assert.strictEqual(cachedFS.cache.size, 0, 'Cache is not empty');
  })();
};

const checkTimeInCache = () => {
  const cachedFS = new CacheFile(fs['readFile'], 2000, 100);

  cachedFS.readFile('Class-Cache/Tests/Test-CacheFile.js', 'utf8', (err, data) => {
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

const priorityTest = () => {
  const INC = 1024;
  const size1 = fs.statSync('Class-Cache/Tests/Test.txt').size;
  const size2 = fs.statSync('Class-Cache/Tests/Test-CacheFile.js').size;
  const size3 = fs.statSync('Class-Cache/Tests/Test-CacheFunc.js').size;
  const cacheSize = (size1 + size2 + 1) / INC;
  const cachedFS = new CacheFile(fs['readFile'], 3000, cacheSize);
  const requiredSize = (size1 + size3) / INC;

  cachedFS.readFile('Class-Cache/Tests/Test.txt', 'utf8', (err, data) => {
    if (err) console.log(err);

    cachedFS.readFile('Class-Cache/Tests/Test-CacheFile.js', 'utf8', (err, data) => {
      if (err) console.log(err);

      cachedFS.readFile('Class-Cache/Tests/Test-CacheFunc.js', 'utf8', (err, data) => {
        if (err) console.log(err);

        assert.strictEqual(cachedFS.size, requiredSize, 'Priority test failed');
      });
    });
  });
};

const addMethodTest = () =>  {
  const cachedFS = new CacheFile(fs['readFile'], 2000, 100);
  cachedFS.addMethod(fs['lstat']);

cachedFS.lstat('Class-Cache/Tests/Test.txt', 'utf8', (err, data) => {
  if (err) console.log(err);
  assert.strictEqual(cachedFS.cache.size, 1, 'Lstat is not working');
  });
};

const tests = [checkTimeInCache, clearTest, maxSizeTest, speedTest, priorityTest, addMethodTest];

for (const test of tests) {
  try {
    test();
  } catch (err) {
    console.log(err);
  }
}
