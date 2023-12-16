import { EventEmitter } from "./EventEmitter"
import { ElevatorEventsEnum, TechnicalStateEnum, PrincipalStateEnum, type ElevatorConfig, type Request } from "./types"
import { delay, createDeferred, type Deferred } from "./utils"
import { PriorityQueueWrapper } from "./PriorityQueueWrapper"



export class Elevator extends EventEmitter {
    private principalState: PrincipalStateEnum;
    private technicalState!: TechnicalStateEnum
    private downQueue = new PriorityQueueWrapper(true, (a: Request, b: Request) => b.floor - a.floor, (a, b) => a.floor === b.floor);
    private upQueue = new PriorityQueueWrapper(true, (a: Request, b: Request) => a.floor - b.floor, (a, b) => a.floor === b.floor);
    private floorRange: number[] = []
    private stopDelay: number
    private travelDelay: number
    private closeDoorCancelationPromise!: Deferred<any>
    private isDestroyed: boolean = false
    private currentFloor = 0
    private floorsOrderedDown: number[] = []
    private floorsOrderedUp: number[] = []
    private selectedFloors: number[] = []

    constructor(config: ElevatorConfig) {
        super()
        const { floorRange, stopDelay, travelDelay } = config
        this.stopDelay = stopDelay
        this.travelDelay = travelDelay
        this.principalState = PrincipalStateEnum.IDLE
        this.technicalState = TechnicalStateEnum.DOOR_CLOSED
        this.floorRange = floorRange
    }

    private switchQueueIfNeeded(currentRequest: Request, currentQueue: PriorityQueueWrapper<Request>, oppositeQueue: PriorityQueueWrapper<Request>, isMovingUp: boolean) {
        const isCurrentFloorLast = currentQueue.length === 1;
        if (currentRequest.requestDirection === (isMovingUp ? 'DOWN' : 'UP') && !isCurrentFloorLast) {
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

    private switchToNextState() {
        if (this.upQueue.length) {
            this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP);
        } else if (this.downQueue.length) {
            this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN);
        } else {
            this.switchPrincipalState(PrincipalStateEnum.IDLE);
        }
    }

    private async processQueue(direction: 'UP' | 'DOWN') {
        const isMovingUp = direction === 'UP';
        const currentQueue = isMovingUp ? this.upQueue : this.downQueue;
        const oppositeQueue = isMovingUp ? this.downQueue : this.upQueue;

        while (currentQueue.length && !this.isDestroyed) {
            const nextFloor = this.currentFloor + (isMovingUp ? 1 : -1);
            await delay(this.travelDelay);

            this.currentFloor = nextFloor;
            this.emit(ElevatorEventsEnum.CURRENT_FLOOR, nextFloor);

            const currentRequest = currentQueue.peek();

            if (currentRequest.floor === nextFloor) {
                const switched = this.switchQueueIfNeeded(currentRequest, currentQueue, oppositeQueue, isMovingUp);
                if (switched) continue;

                this.handleStoppedAtFloor(direction, nextFloor);
                await delay(this.stopDelay);
            }
        }

        this.switchToNextState();
    }

    private handleStoppedAtFloor(direction: 'DOWN' | 'UP', floor: number) {
        const filterFunc = (f: number) => f !== floor
        const queue = direction === 'DOWN' ? this.downQueue : this.upQueue
        queue.dequeue()
        this.selectedFloors = this.selectedFloors.filter(filterFunc)
        this.floorsOrderedDown = this.floorsOrderedDown.filter(filterFunc)
        this.floorsOrderedUp = this.floorsOrderedUp.filter(filterFunc)
        this.emit(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.selectedFloors)
        this.emit(ElevatorEventsEnum.CURRENT_FLOOR, this.currentFloor)
        this.emit(ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, this.floorsOrderedDown)
        this.emit(ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, this.floorsOrderedUp)
        this.emit(ElevatorEventsEnum.STOPPING_AT_FLOOR, this.currentFloor)
    }

    private withIdleCheck(func: Function) {
        return (floor:number,...rest:any[]) => {
            func(floor,...rest)
            if(this.principalState !== PrincipalStateEnum.IDLE){
                return;
            }            
            if (floor > this.currentFloor) {

                this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP)
            } else {
                this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN)
            }
        }
    }

    
    private switchPrincipalState(state: PrincipalStateEnum) {
        if (state === this.principalState) {
            return;
        }
        this.principalState = state;
        this.emit(ElevatorEventsEnum.PRINCIPAL_STATE_CHANGE, state)
        this.run();
    }

    private handleExternalOrder = this.withIdleCheck((floor:number,requestDirection: 'UP' | 'DOWN')=>{
        if (floor === this.currentFloor) {
            return;
        }
        const arrayToUpdate = requestDirection === 'DOWN' ? this.floorsOrderedDown : this.floorsOrderedUp
        const request: Request = { floor, type: 'REQUEST_DIRECTION', requestDirection }
        arrayToUpdate.push(floor)
        if (floor > this.currentFloor) {
            this.upQueue.queue(request)            
        } else {
            this.downQueue.queue(request)         
        }
        this.emit(requestDirection === 'DOWN' ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, arrayToUpdate)
    })

    destroy() {
        this.isDestroyed = true;
        this.cleanup()
    }


    chooseFloor = this.withIdleCheck((floor: number)=> {
        if (this.selectedFloors.includes(floor) || floor === this.currentFloor) {
            return
        }
        // const direction = floor < this.currentFloor ? 'DOWN' : 'UP'
        const relevantQueue = floor < this.currentFloor ? this.downQueue : this.upQueue
        const request: Request = { floor, type: 'REQUEST_SPECIFIC_FLOOR' }
        relevantQueue.queue(request)
        this.selectedFloors.push(floor)
        this.emit(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.selectedFloors)
    })   


    run() {
        if (this.isDestroyed) return;

        if (this.principalState === PrincipalStateEnum.DESIGNATED_UP) {
            this.processQueue('UP');
        } else if (this.principalState === PrincipalStateEnum.DESIGNATED_DOWN) {
            this.processQueue('DOWN');
        }
    }

   
    orderUp(floor: number) {
        this.handleExternalOrder(floor, 'UP')
    }

    orderDown(floor: number) {
        this.handleExternalOrder(floor, 'DOWN')
    }

    

    // Additional methods for handling elevator logic...


    // Any additional helper methods, cleanup methods, etc.
}
