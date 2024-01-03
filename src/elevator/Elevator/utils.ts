import { DesignatedDirectionEnum } from "..";

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

export function hasLowerOrHigherNumber(
  currentFloor: number, 
  checkHigher: boolean,
  ...numberArrays: number[][]
): boolean {
  // Combine all arrays into a single array
  const combinedFloors = numberArrays.flat();

  // Check for a higher or lower floor
  for (const floor of combinedFloors) {
    if (checkHigher && floor > currentFloor) {
      return true;
    } else if (!checkHigher && floor < currentFloor) {
      return true;
    }
  }

  // Return false if no matching floor is found
  return false;
}

export function hasHigher(
  currentFloor: number,   
  ...numberArrays: number[][]
): boolean {
  return hasLowerOrHigherNumber(currentFloor,true,...numberArrays)
}


export function hasLower(
  currentFloor: number,   
  ...numberArrays: number[][]
): boolean {
  return hasLowerOrHigherNumber(currentFloor,false,...numberArrays)
}



export function getTotalDistanceToDestination(
  currentFloor: number,
  designatedDirection: DesignatedDirectionEnum,
  floorsOrderedDown: number[],
  floorsOrderedUp: number[],
  selectedFloors: number[],
  returnFloor: number
): number {
  if (designatedDirection === DesignatedDirectionEnum.IDLE) {
      return Math.abs(currentFloor - returnFloor);
  }

  let maxUpFloor = Math.max(...floorsOrderedUp, ...selectedFloors.filter(f => f > currentFloor));
  let minDownFloor = Math.min(...floorsOrderedDown, ...selectedFloors.filter(f => f < currentFloor));

  // Handle cases where no upper or lower bounds are found
  maxUpFloor = isFinite(maxUpFloor) ? maxUpFloor : currentFloor;
  minDownFloor = isFinite(minDownFloor) ? minDownFloor : currentFloor;

  if (designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP) {
      // Calculate total floors to the topmost floor and back to the return floor
      const upDistance = maxUpFloor - currentFloor;
      const downDistance = maxUpFloor - returnFloor;
      return upDistance + Math.abs(downDistance);
  } else {
      // Calculate total floors to the lowest floor and back to the return floor
      const downDistance = currentFloor - minDownFloor;
      const upDistance = returnFloor - minDownFloor;
      return downDistance + Math.abs(upDistance);
  }
}

export function isFloorOnTheWay(floor:number,currentDirection:DesignatedDirectionEnum,floorRange:number[]){

}



//if idle return empty array
//

