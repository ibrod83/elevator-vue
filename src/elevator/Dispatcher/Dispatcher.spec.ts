import { describe, it, expect } from 'vitest';
import { Elevator, ElevatorEventsEnum } from '../';
// import { delay, getRandomWholeNumber } from './utils';
import { waitForEvent, waitForFloor } from '../testUtils';
import type { ElevatorConfig } from '../Elevator/types';
// import type { ElevatorConfig } from './types';




const testTimeout = 30000

const floorRange = [0, 9]
const elevatorConfig: ElevatorConfig = { floorRange, id: 1, travelDelay: 1, doorTimerDelay: 1, completeDoorCycleTime: 5, doorSteps: 5 }

describe('Elevator', () => {
   

    it('Should get total distance to the destination floor', async () => {

    //      // Mock elevators
    // const elevators = [
    //     new Elevator({ id: 1, floorRange: [0, 10], currentFloor: 2, designatedDirection: DesignatedDirectionEnum.IDLE }),
    //     new Elevator({ id: 2, floorRange: [0, 10], currentFloor: 5, designatedDirection: DesignatedDirectionEnum.IDLE }),
    //     new Elevator({ id: 3, floorRange: [0, 10], currentFloor: 8, designatedDirection: DesignatedDirectionEnum.IDLE })
    // ];

    // const dispatcher = new Dispatcher(elevators);

    // const bestElevator = dispatcher.getBestElevator(6, 'UP');

    // expect(bestElevator.id).toBe(2); // Expecting elevator 2 to be closest

    }, { timeout: testTimeout })


   
});
