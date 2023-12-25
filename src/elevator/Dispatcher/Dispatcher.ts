import { EventEmitter } from '../EventEmitter';
import { Elevator } from '../Elevator/Elevator';

export class Dispatcher extends EventEmitter {
    elevators: Elevator[] = []

    constructor(elevators: Elevator[]) {
        super();
        this.elevators = elevators
    }

    private getBestElevator(floor: number) {
        const values = this.elevators.map(e => e.getDistanceToDestinationFloor(floor));
        const minValue = Math.min(...values);

        // Step 2: Find the index of the object with the minimum value
        const minIndex = values.indexOf(minValue);

        // Step 3: Filter out the object at the minIndex
        // const bestElevator = this.elevators.filter((_, index) => index !== minIndex)[0];
        const bestElevator = this.elevators[minIndex]
        return bestElevator
    }

    orderUp(floor: number) {
        // this.elevators[0].orderUp(floor)
        this.getBestElevator(floor).orderUp(floor)
    }

    orderDown(floor: number) {
        this.getBestElevator(floor).orderDown(floor)
    }
}

//Factors:
//the ordering floor
//ordering direction
//distance of each elevator from ordering floor
//current designation of each elevator
//current final destination of each elevator

//abstract description:
//for every elevator, deduce how "quickly" it is designated to go through the ordering floor(in the correct direction), under the current conditions.
//this is true both for idle and non idle elevators.
//traveling through a floor will have a weight of 1, whereas stopping in a floor will have a weight of 2. data will be normalized.
