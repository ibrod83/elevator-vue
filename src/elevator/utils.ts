
export function delay(mil: number) {
  return new Promise((res) => {
    setTimeout(res, mil)
  })
}



export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
};

export function createDeferred<T>(): Deferred<T> {
  let resolve: Deferred<T>['resolve'];
  let reject: Deferred<T>['reject'];

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}



export function getRandomWholeNumber(min: number, max: number) {
  // Ensure that the min and max are whole numbers
  min = Math.ceil(min);
  max = Math.floor(max);

  // Generate a random number in the range [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function hasLowerOrHigherFloor(hashmap: { [index: number]: string|null }, currentFloor: number, checkHigher: boolean): boolean {
  for (const key in hashmap) {
    const currentKey = parseInt(key);
    if (checkHigher && hashmap[currentKey] && currentKey > currentFloor) {
      return true;
    } else if (!checkHigher && hashmap[currentKey] && currentKey < currentFloor) {
      return true;
    }
  }
  return false;
}