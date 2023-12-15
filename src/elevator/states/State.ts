import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { Elevator } from "../Elevator";
import type { PriorityQueueWrapper } from "../PriorityQueueWrapper";
import type { Request } from "../types";
import { delay } from "../utils";

const DIRECTION_UP = 'UP';
const DIRECTION_DOWN = 'DOWN';
export abstract class State {
    protected elevator: Elevator;

    constructor(elevator: Elevator) {
        this.elevator = elevator;
    }

    // public abstract orderUp(floor: number): void;
    // public abstract orderDown(floor: number): void;
    public abstract run(): void;
   

    private switchToNextState() {
        if (this.elevator.upQueue.length) {
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP);
        } else if (this.elevator.downQueue.length) {
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN);
        } else {
            this.elevator.switchPrincipalState(PrincipalStateEnum.IDLE);
        }
    }

    // New function to handle queue switching
    private switchQueueIfNeeded(currentRequest: Request, currentQueue: PriorityQueueWrapper<Request>, oppositeQueue: PriorityQueueWrapper<Request>, isMovingUp: boolean) {
        if (currentRequest.requestDirection === (isMovingUp ? DIRECTION_DOWN : DIRECTION_UP)) {
            currentQueue.dequeue();
            oppositeQueue.queue({
                floor: currentRequest.floor,
                type: "REQUEST_DIRECTION",
                requestDirection: currentRequest.requestDirection
            });
            return true;
        }
        return false;
    }

    protected async processQueue(direction: 'UP' | 'DOWN') {
        const isMovingUp = direction === DIRECTION_UP;
        const currentQueue = isMovingUp ? this.elevator.upQueue : this.elevator.downQueue;
        const oppositeQueue = isMovingUp ? this.elevator.downQueue : this.elevator.upQueue;

        while (currentQueue.length && !this.elevator.isDestroyed) {
            const nextFloor = this.elevator.currentFloor + (isMovingUp ? 1 : -1);
            await delay(this.elevator.travelDelay);

            this.elevator.currentFloor = nextFloor;
            this.elevator.emitEvent(ElevatorEventsEnum.CURRENT_FLOOR, nextFloor);

            const currentRequest = currentQueue.peek();

            if (currentRequest.floor === nextFloor) {
                const switched = this.switchQueueIfNeeded(currentRequest, currentQueue, oppositeQueue, isMovingUp);
                if (switched) continue;

                this.handleStoppedAtFloor(direction, nextFloor);
                await delay(this.elevator.stopDelay);
            }
        }

        this.switchToNextState();
    }


    protected handleChooseFloor(locationRelativeToCurrent: 'DOWN' | 'UP', floor: number) {

        if (this.elevator.selectedFloors.includes(floor)) {
            return
        }

        const request: Request = { floor, type: 'REQUEST_SPECIFIC_FLOOR' }
        if (locationRelativeToCurrent === 'DOWN') {
            this.elevator.downQueue.queue(request)
        } else {
            this.elevator.upQueue.queue(request)
        }

        this.elevator.selectedFloors.push(floor)//

        this.elevator.emitEvent(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.elevator.selectedFloors)

    }

   

    handleExternalOrder(floor: number, requestDirection: 'UP' | 'DOWN') {
        if (floor === this.elevator.currentFloor) {
            return;
        }
        const arrayToUpdate = requestDirection === 'DOWN' ? this.elevator.floorsOrderedDown : this.elevator.floorsOrderedUp
        const request: Request = { floor, type: 'REQUEST_DIRECTION', requestDirection }
        arrayToUpdate.push(floor)
        if (floor > this.elevator.currentFloor) {
            this.elevator.upQueue.queue(request)
        } else {
            this.elevator.downQueue.queue(request)
        }
        this.elevator.emitEvent(requestDirection === 'DOWN' ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, arrayToUpdate)

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
