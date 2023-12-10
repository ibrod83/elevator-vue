import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { Elevator } from "../Elevator";
export abstract class State {
    protected elevator: Elevator;

    constructor(elevator: Elevator) {
        this.elevator = elevator;
    }

    public abstract orderUp(floor: number): void;
    public abstract orderDown(floor: number): void;
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

        this.elevator.selectedFloors.push(floor)

        this.elevator.emitEvent(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.elevator.selectedFloors)

    }
    // protected handleExternalOrder(floor: number, direction: 'UP' | 'DOWN') {
    //     if (floor === this.elevator.currentFloor) {
    //         return;
    //     }
    //     const arrayToUpdate = direction === 'DOWN' ? this.elevator.floorsOrderedDown : this.elevator.floorsOrderedUp

    //     arrayToUpdate.push(floor)
    //     if (floor > this.elevator.currentFloor) {
    //         this.handleAddToQueue('UP', floor)
    //     } else {
    //         this.handleAddToQueue('DOWN', floor)
    //     }
    //     this.elevator.emitEvent(direction === 'DOWN' ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, arrayToUpdate)
    // }

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

    protected switchToNextState() {
        if (this.elevator.upQueue.length) {
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP);
        } else if (this.elevator.downQueue.length) {
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN);
        } else {
            this.elevator.switchPrincipalState(PrincipalStateEnum.IDLE);
        }
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
