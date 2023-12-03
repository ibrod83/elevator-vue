import { PrincipalStateEnum, TechnicalStateEnum } from ".";

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


export enum DigestResult{
  UP='UP',
  DOWN='DOWN',
  STOP='STOP'
}

export function digest(floorRange: number[],
  currentFloor: number,
  floorsAwaitingUp: number[],
  floorsAwaitingDown: number[],
  chosenFloorsFromElevator: number[],
  principalState: PrincipalStateEnum,
  technicalState:TechnicalStateEnum
) {
  switch (principalState) {
    case PrincipalStateEnum.IDLE:
      //if there is a higher chosenFloor, go up
      //if there is a higher floor, that ordered either up or down, go up
      //otherwise stop
      break;
    case PrincipalStateEnum.DESIGNATED_UP:
        //TechnicalState moving:
           //if currentFloor is in chosenFloorsFromElevator, stop
           // if current Floor is included in floorsAwaitingUp, stop
           //if floorsAwaitingUp contains a floor higher than the current one, go up
           //in case floorsAwaitingUp is empty
              //if floorsAwaitingDown has a higher floor than the current one, go up
              //if floorsAwaitingDown is empty, stop

     

      break;

    default:
      break;
  }
}



export function doesArrayIncludeLargerNumber(number: number, arrayOfNumbers: number[]) {
  return arrayOfNumbers.some(n => n > number)
}

export function doesArrayIncludeSmallerNumber(number: number, arrayOfNumbers: number[]) {
  return arrayOfNumbers.some(n => n < number)
}

