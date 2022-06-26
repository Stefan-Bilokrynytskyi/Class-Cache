# Class CacheFunc
Class **"CacheFunc"** is created for caching of functions. The main advantage of instances of this class is **high** speed of work 
comparing to simple functions. User has access only to two methods of **"CacheFunc"**: 
* CacheFunc.do() - executes the function that was cached when the instance of **"CacheFunc"** was initialized;
* CacheFunc.clear() - clears the cache; 

Cache has these parameters: **length of elements, time in cache of each element,  priority of crowding out**.  
Priority of crowding out is calculated by time of execution of function. The more time of execution => the more complex calculations, so  
priority of crowding out will be higher.
### Initialization
```js
const cachedFn = new CacheFunc(callback, time, length);
```
>_**callback**_ - cached function;  
>**time** - time in cache of each element;  
>**length** - quantity of elements;
### Example of usage:  
```js
const fib = (n) => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2));
const cachedFib = new CacheFunc(fib, 2000, 3);
cachedFib.do(20);
cachedFib.do(20); //from cache
cachedFib.clear() //cache is empty
```


