'use strict';

const CacheFile = require('../CacheFile');
const fs = require('fs');

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
      await readfile1('Test.txt', 'UTF8');
    }
    let end = new Date().getTime();

    const time1 = end - start;
    console.log('Time fs:' + time1);

    start = new Date().getTime();
    for (let i = 0; i < LOOP_COUNT; i++) {
      await readfile2('Test.txt', 'UTF8');
    }
    end = new Date().getTime();

    const time2 = end - start;
    console.log('Time cachedFS:' + time2);
    if (time1 <= time2) throw new Error('Speed test failed');
  })();
};

speedTest();
