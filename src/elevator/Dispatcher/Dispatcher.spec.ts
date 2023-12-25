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

        const elevator1 = new Elevator(elevatorConfig)
        const elevator2 = new Elevator(elevatorConfig)
       
        
        

    }, { timeout: testTimeout })


   
});
