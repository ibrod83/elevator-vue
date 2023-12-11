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
    it('Should travel up and down correctly, via internal commands', async () => {

        const floorRange = [0, 9]
        const elevator = new Elevator({ floorRange, travelDelay: 1, stopDelay: 2 })

        elevator.chooseFloor(1) 
        elevator.chooseFloor(9)
        elevator.chooseFloor(5)
        let floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(1)

        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(5)

        elevator.chooseFloor(0)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(9)

        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(0)

    }, { timeout: Infinity })

    it('Should travel up and down correctly, via internal and external commands', async () => {

        const floorRange = [0, 9]
        const elevator = new Elevator({ floorRange, travelDelay: 1, stopDelay: 2 })

        elevator.chooseFloor(1) 
        elevator.chooseFloor(9)
        elevator.chooseFloor(5)
        let floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(1)

        elevator.orderUp(7)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(5)

        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(7)

        elevator.orderDown(2)

        elevator.chooseFloor(0)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(9)
        
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(2)
        
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(0)

        elevator.orderUp(8)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(8)

        elevator.orderUp(0)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(0)


    }, { timeout: Infinity })

    // it('Range test', async () => {

    //     const floorRange = [0, 9]
    //     const elevator = new Elevator({ floorRange, travelDelay: 1, stopDelay: 2 })


    //     for (let i = 0; i < 200; i++) {//
    //         elevator.chooseFloor(1)
    //         await delay(1)
    //         elevator.chooseFloor(9)
    //         elevator.chooseFloor(5)
    //         let floor = await waitForEvent(elevator, ElevatorEventsEnum.CURRENT_FLOOR)
    //         expect(floor).toBeGreaterThanOrEqual(floorRange[0]);
    //         expect(floor).toBeLessThanOrEqual(floorRange[1]);//
    //         elevator.chooseFloor(getRandomWholeNumber(0, 9))
    //         await delay(1)
    //         elevator.chooseFloor(getRandomWholeNumber(0, 9))
    //         floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //         expect(floor).toBeGreaterThanOrEqual(floorRange[0]);
    //         expect(floor).toBeLessThanOrEqual(floorRange[1]);
    //         elevator.chooseFloor(getRandomWholeNumber(0, 9))//
    //         await delay(1)
    //         elevator.chooseFloor(getRandomWholeNumber(0, 9))
    //         floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //         expect(floor).toBeGreaterThanOrEqual(floorRange[0]);
    //         expect(floor).toBeLessThanOrEqual(floorRange[1]);
    //     }




    // }, { timeout: Infinity })
});
