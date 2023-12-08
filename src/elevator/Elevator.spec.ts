import { describe, it, expect } from 'vitest';
import { Elevator, ElevatorEventsEnum } from '.';
import { delay, getRandomWholeNumber } from './utils';
import type { EventEmitter } from './EventEmitter';


function waitForEvent(eventEmitter: EventEmitter, eventName: string) {
    return new Promise(resolve => {
        const handler = (data: any) => {
            resolve(data);
        };
        eventEmitter.once(eventName, handler);  // using 'once' instead of 'on' to automatically remove listener after triggering
    });
}



describe('Elevator', () => {
    it('Range test', async () => {

        const floorRange = [0, 9]
        const elevator = new Elevator({ floorRange, travelDelay: 1, stopDelay: 2 })


        for (let i = 0; i < 250; i++) {
            elevator.chooseFloor(1)
            await delay(1)
            elevator.chooseFloor(9)
            elevator.chooseFloor(5)
            let floor = await waitForEvent(elevator, ElevatorEventsEnum.CURRENT_FLOOR)
            expect(floor).toBeGreaterThanOrEqual(floorRange[0]);
            expect(floor).toBeLessThanOrEqual(floorRange[1]);//
            elevator.chooseFloor(getRandomWholeNumber(0, 9))
            await delay(1)
            elevator.chooseFloor(getRandomWholeNumber(0, 9))
            floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
            expect(floor).toBeGreaterThanOrEqual(floorRange[0]);
            expect(floor).toBeLessThanOrEqual(floorRange[1]);
            elevator.chooseFloor(getRandomWholeNumber(0, 9))//
            await delay(1)
            elevator.chooseFloor(getRandomWholeNumber(0, 9))
            floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
            expect(floor).toBeGreaterThanOrEqual(floorRange[0]);
            expect(floor).toBeLessThanOrEqual(floorRange[1]);
        }




    },{timeout:Infinity})
});
