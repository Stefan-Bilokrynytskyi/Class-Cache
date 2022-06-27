# Class CacheFunc
Class **CacheFunc** is created for caching of functions. The main advantage of instances of this class is **high** speed of work 
comparing to simple functions. User has access only to two methods of **CacheFunc**: 
* CacheFunc.do() - executes the function that was cached when the instance of **CacheFunc** was initialized;
* CacheFunc.clear() - clears the cache; 

Cache has these parameters: **length of elements, time in cache of each element,  priority of crowding out**.  
Priority of crowding out is calculated by time of execution of function. The more time of execution => the more complex calculations, so  
priority of crowding out will be higher.
### Initialization
```js
const cachedFn = new CacheFunc(callback, time, length);
```
>_**callback**_ - cached function;  
>**time** - time in cache of each element in milliseconds;  
>**length** - quantity of elements;
### Example of usage:  
```js
const fib = (n) => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2));
const cachedFib = new CacheFunc(fib, 2000, 3);
cachedFib.do(20);
cachedFib.do(20); //from cache
cachedFib.clear() //cache is empty
```
# Class CacheFile
Class **CacheFile** is created for caching functions of callback API of library "fs". It makes sense to cache only functions   
**fs.readFile()** and **fs.lstat()** that is why class **CacheFile** working correctly only with these methods. The main  
advantage of instances of this class is **higher** speed of work than "fs" methods.  
User has access only to these methods of **CacheFile**:
* CacheFile.prototype[fn.name] - cached function;
* CacheFile.clear() - clears the cache;
* CacheFile.addMethod - adds the cached function;  
Cache has these parameters: **size of cache, time in cache of each element,  priority of crowding out**.  
Priority of crowding out is calculated by size of reading file. The bigger file => the more time needed to read it, so  
priority of crowding out will be higher.
### Initialization
```js
const cachedFS = new CacheFile(callback, time, maxSize);
```  
>_**callback**_ - cached method of "fs";  
>**time** - time in cache of each element in milliseconds;  
>**maxSize** - maximum size of cache in kilobytes;
### Example of usage:  
```js
const cachedFS = new CacheFile(fs['readFile'], 2000, 10);

cachedFS.readFile('Test-CacheFunc.js', 'utf8', (err, data) => {
  if (err) console.log(err);
  else console.log(data.toString());
  cachedFS.readFile('Test-CacheFile.js', 'utf8', (err, data) => { //from cache
    if (err) console.log(err);
    else console.log(data.toString());
  });
});
```

