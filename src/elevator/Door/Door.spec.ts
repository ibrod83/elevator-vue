// Import the necessary modules and classes
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForEvent } from '../testUtils';
import {Door as ElevatorDoor } from './Door'; // Assuming ElevatorDoor is in the same directory
import { DoorEventsEnum } from './types';
const testTimeout = Infinity
describe('Door', () => {
    let elevatorDoor: ElevatorDoor;

    beforeEach(() => {
        elevatorDoor = new ElevatorDoor({completeDoorCycleTime:5,doorSteps:5});//
    });

    afterEach(() => {
        // Clear any ongoing intervals after each test
        elevatorDoor.close(); // This will clear the interval if any
    });

    it('should open correctly', async () => {
        elevatorDoor.open();//
        const before = Date.now()
        await waitForEvent(elevatorDoor, DoorEventsEnum.DOOR_OPENED);
        const after = Date.now()
        const diff = after-before;
        
        expect(elevatorDoor.doorPercentage).toBe(0); // Check if door is fully opened
    },{timeout:testTimeout});

    it('should close correctly', async () => {
        elevatorDoor.open();
        await waitForEvent(elevatorDoor, DoorEventsEnum.DOOR_OPENED);
        elevatorDoor.close();
        await waitForEvent(elevatorDoor, DoorEventsEnum.DOOR_CLOSED);
        expect(elevatorDoor.doorPercentage).toBe(100); // Check if door is fully closed
    });

    it('should cancel closing when opening is triggered', async () => {//
        elevatorDoor.open();
        await waitForEvent(elevatorDoor, DoorEventsEnum.DOOR_OPENED);

        elevatorDoor.close();
        
        await new Promise(resolve => setTimeout(resolve, elevatorDoor.completeDoorCycleTime / 4));
        // console.log('elevatorDoor.doorPercentage',elevatorDoor.doorPercentage)//
        expect(elevatorDoor.doorPercentage).toBeLessThan(100); // Door should have started closing

        elevatorDoor.open();
        await waitForEvent(elevatorDoor, DoorEventsEnum.DOOR_OPENED);
        
        expect(elevatorDoor.doorPercentage).toBe(0); // Check if door is fully opened
    });
});
