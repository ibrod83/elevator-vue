import { ElevatorEventsEnum, type Elevator } from ".";
import type { EventEmitter } from "./EventEmitter";

export function waitForEvent(eventEmitter: EventEmitter, eventName: string) {
    return new Promise(resolve => {
        const handler = (data: any) => {
            resolve(data);
        };
        eventEmitter.once(eventName, handler);  // using 'once' instead of 'on' to automatically remove listener after triggering
    });
}

export async function waitForFloor(elevator:Elevator,targetFloor:number,waitForStop:boolean=false){
    while(true){
        const floor = await waitForEvent(elevator,waitForStop ? ElevatorEventsEnum.STOPPING_AT_FLOOR :  ElevatorEventsEnum.CURRENT_FLOOR)
        if(floor === targetFloor){
            break;
        }    
    }
}