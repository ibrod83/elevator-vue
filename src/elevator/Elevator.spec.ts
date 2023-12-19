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

const testTimeout = 10000

const floorRange = [0, 9]
const elevatorConfig={floorRange, travelDelay: 1, openDoorDelay: 2,closeDoorDelay:2}

describe('Elevator', () => {
    it('Should travel up and down correctly, via internal commands', async () => {

        
        const elevator = new Elevator(elevatorConfig)

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

    },{timeout:testTimeout})

    it('Should travel up and down correctly, via internal and external commands', async () => {

        const floorRange = [0, 9]
        const elevator = new Elevator(elevatorConfig)

        elevator.chooseFloor(1) //1,5,7,9,6,2,0,8,0
        elevator.chooseFloor(9)
        elevator.chooseFloor(5)
        let floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(1)

        elevator.orderUp(7)
        elevator.orderDown(6)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(5)     

        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(7)

        elevator.orderDown(2)

        elevator.chooseFloor(0)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(9)
        //switches direction
        
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(6)
        
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(2)

        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(0)

       

    },{timeout:testTimeout})

    // it('Should travel up and down correctly, via internal and external commands', async () => {

    //     const floorRange = [0, 9]
    //     const elevator = new Elevator({ floorRange, travelDelay: 1, stopDelay: 2 })

    //     elevator.chooseFloor(1) //1,5,7,9,6,2,0,8,0
    //     elevator.chooseFloor(9)
    //     elevator.chooseFloor(5)
    //     let floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //     expect(floor).toBe(1)

    //     elevator.orderUp(7)
    //     elevator.orderDown(6)
    //     floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //     expect(floor).toBe(5)     

    //     floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //     expect(floor).toBe(7)

    //     elevator.orderDown(2)

    //     elevator.chooseFloor(0)
    //     floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //     expect(floor).toBe(9)
    //     //switches direction
        
    //     floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //     expect(floor).toBe(6)
        
    //     floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //     expect(floor).toBe(2)

    //     elevator.orderUp(8)
    //     floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //     expect(floor).toBe(0)

    //     elevator.orderUp(8)
    //     floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
    //     expect(floor).toBe(8)

    // })

    it('Should handle last floor up and down edge cases', async () => {

        const floorRange = [0, 9]
        const elevator = new Elevator(elevatorConfig)
        

        elevator.orderUp(9)
        var floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(9)     

        elevator.orderDown(0)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(0)

        elevator.orderDown(9)
        var floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(9)   

        elevator.orderUp(0)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(0)


    })

    it('Should stop if a floor ordered opposite direction, and there are no more floors in the current direction', async () => {

        const floorRange = [0, 9]
        const elevator = new Elevator(elevatorConfig)
        

        elevator.orderDown(5)
        var floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(5)     

        elevator.orderUp(2)
        floor = await waitForEvent(elevator, ElevatorEventsEnum.STOPPING_AT_FLOOR)
        expect(floor).toBe(2)     


    },{timeout:testTimeout})

    // it('Range test', async () => {

    //     const floorRange = [0, 9]
    //     const elevator = new Elevator({ floorRange, travelDelay: 1, stopDelay: 1 })


    //     for (let i = 0; i < 100; i++) {//
    //         elevator.chooseFloor(1)
    //         await delay(1)
    //         elevator.chooseFloor(9)
    //         elevator.chooseFloor(5)
    //         let floor = await waitForEvent(elevator, ElevatorEventsEnum.CURRENT_FLOOR)
    //         expect(floor).toBeGreaterThanOrEqual(floorRange[0]);
    //         expect(floor).toBeLessThanOrEqual(floorRange[1]);//
    //         elevator.chooseFloor(getRandomWholeNumber(0, 9))
    //         // await delay(1)
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




    // }, { timeout: 30000 })
});
