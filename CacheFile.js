'use strict';

const fs = require('fs');

class CacheFile {
  constructor(fn, time) {
    this.fn = fn;
    this.cache = new Map();
    this.priority = new Map();
    this.time = time;
    CacheFile.prototype[fn.name] = this.createMethod(fn);
  }

  createMethod(fn) {
    return (...args) => {
      const cb = args.pop();
      const key = args[0];
      const record = this.cache.get(key);

      if (record) {
        console.log('from cache');
        cb(record.err, record.data);
        return;
      }
      fn(...args, (err, data) => {
        this.cache.set(key, { err, data });

        cb(err, data);
      });
    };
  }
}
const test = new CacheFile(fs['readFile'], 5000);

test.readFile('CacheFunc.js', 'UTF8', (err, data) => {
  if (err) console.log(err);
  else console.log(data.toString());
  test.readFile('CacheFunc.js', 'UTF8', (err, data) => {
    if (err) console.log(err);
    else console.log(data.toString());
  });
});
