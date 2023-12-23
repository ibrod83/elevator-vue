import type { EventEmitter } from "./EventEmitter";

export function waitForEvent(eventEmitter: EventEmitter, eventName: string) {
    return new Promise(resolve => {
        const handler = (data: any) => {
            resolve(data);
        };
        eventEmitter.once(eventName, handler);  // using 'once' instead of 'on' to automatically remove listener after triggering
    });
}