import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { Elevator } from "../Elevator";
import { delay } from "../utils";
export abstract class State {
    protected elevator: Elevator;

    constructor(elevator: Elevator) {
        this.elevator = elevator;
    }

    // public abstract orderUp(floor: number): void;
    // public abstract orderDown(floor: number): void;
    public abstract run(): void;

    protected handleAddToQueue(direction: 'DOWN' | 'UP', floor: number) {
        const queue = direction === 'DOWN' ? this.elevator.downQueue : this.elevator.upQueue
        queue.queue(floor)
    }
    protected handleChooseFloor(direction: 'DOWN' | 'UP', floor: number) {

        if (this.elevator.selectedFloors.includes(floor)) {
            return
        }

        this.handleAddToQueue(direction, floor)

        this.elevator.selectedFloors.push(floor)//

        this.elevator.emitEvent(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.elevator.selectedFloors)

    }

    protected switchToNextState() {
        if (this.elevator.upQueue.length) {
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP);
        } else if (this.elevator.downQueue.length) {
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN);
        } else {
            this.elevator.switchPrincipalState(PrincipalStateEnum.IDLE);
        }
    }

    protected async processQueue(direction: 'UP' | 'DOWN') {
        const isMovingUp = direction === 'UP';
        const queue = isMovingUp ? this.elevator.upQueue : this.elevator.downQueue;
        const floorsOrdered = isMovingUp ? this.elevator.floorsOrderedDown : this.elevator.floorsOrderedUp;
        const oppositeQueue = isMovingUp ? this.elevator.downQueue : this.elevator.upQueue;

        while (queue.length && !this.elevator.isDestroyed) {
            const nextFloor = this.elevator.currentFloor + (isMovingUp ? 1 : -1);
            await delay(this.elevator.travelDelay);

            // Update the current floor
            this.elevator.currentFloor = nextFloor;
            this.elevator.emitEvent(ElevatorEventsEnum.CURRENT_FLOOR, this.elevator.currentFloor);

            const isExternalOrder = floorsOrdered.includes(nextFloor);
            const isCurrentFloorLast = queue.length === 1;
            if(nextFloor === 5){
                debugger;
            }
            if (queue.peek() === nextFloor) {
                if (isExternalOrder && !isCurrentFloorLast) {
                    queue.dequeue();
                    oppositeQueue.queue(nextFloor);
                    continue;
                }
                this.handleStoppedAtFloor(direction, nextFloor);
                await delay(this.elevator.stopDelay);
            }
        }

        this.switchToNextState();
    }

    handleExternalOrder(floor: number, direction: 'UP' | 'DOWN') {
        if (floor === this.elevator.currentFloor) {
            return;
        }
        const arrayToUpdate = direction === 'DOWN' ? this.elevator.floorsOrderedDown : this.elevator.floorsOrderedUp

        arrayToUpdate.push(floor)
        if (floor > this.elevator.currentFloor) {
            this.handleAddToQueue('UP', floor)
        } else {
            this.handleAddToQueue('DOWN', floor)
        }
        this.elevator.emitEvent(direction === 'DOWN' ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, arrayToUpdate)

    }
    

    orderDown(floor: number) {
        this.handleExternalOrder(floor, 'DOWN')
    }

    orderUp(floor: number) {
        this.handleExternalOrder(floor, 'UP')
    }

    
    chooseFloor(floor: number) {
        if (floor < this.elevator.currentFloor) {

            this.handleChooseFloor('DOWN', floor)
        } else if (floor > this.elevator.currentFloor) {
            this.handleChooseFloor('UP', floor)//
        } else {
            return
        }
    }


    handleStoppedAtFloor(direction: 'DOWN' | 'UP', floor: number) {
        const filterFunc = (f: number) => f !== floor
        const queue = direction === 'DOWN' ? this.elevator.downQueue : this.elevator.upQueue
        queue.dequeue()
        this.elevator.selectedFloors = this.elevator.selectedFloors.filter(filterFunc)
        this.elevator.floorsOrderedDown = this.elevator.floorsOrderedDown.filter(filterFunc)
        this.elevator.floorsOrderedUp = this.elevator.floorsOrderedUp.filter(filterFunc)
        this.elevator.emitEvent(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.elevator.selectedFloors)
        this.elevator.emitEvent(ElevatorEventsEnum.CURRENT_FLOOR, this.elevator.currentFloor)
        this.elevator.emitEvent(ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, this.elevator.floorsOrderedDown)
        this.elevator.emitEvent(ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, this.elevator.floorsOrderedUp)
        this.elevator.emitEvent(ElevatorEventsEnum.STOPPING_AT_FLOOR, this.elevator.currentFloor)
    }

    
}
