import { EventEmitter } from "./EventEmitter"
import { ElevatorEventsEnum, TechnicalStateEnum, PrincipalStateEnum, type ElevatorConfig, type ElevatorTrackingState, type Request, } from "./types"
import { delay, type Deferred, createDeferred } from "./utils"
import { PriorityQueueWrapper } from "./PriorityQueueWrapper"
// import PriorityQueue from "js-priority-queue"
import type { State } from "./states/State"
import { DesignatedUpState } from "./states/DesignatedUpState"
import { DesignatedDownState } from "./states/DesignatedDownState"
import { IdleState } from "./states/IdleState"
export class Elevator extends EventEmitter {
    private principalState: State;
    technicalState!: TechnicalStateEnum    
    downQueue = new PriorityQueueWrapper(true, function (a: Request, b: Request) { return b.floor - a.floor; },(a,b)=>a.floor===b.floor);
    upQueue = new PriorityQueueWrapper(true, function (a: Request, b: Request) { return a.floor - b.floor; },(a,b)=>a.floor===b.floor);
    floorRange: number[] = []
    stopDelay: number
    travelDelay: number
    closeDoorCancelationPromise!: Deferred<any>
    movementInterval!: string
    isDestroyed: boolean = false
    selectedFloors:Array<number>= []
    floorsOrderedUp:Array<number>= []
    floorsOrderedDown:Array<number>= []
    currentFloor =0

    constructor(config: ElevatorConfig) {
        super()
        const { floorRange, stopDelay, travelDelay } = config
        this.stopDelay = stopDelay
        this.travelDelay = travelDelay
        this.principalState = new IdleState(this)
        this.technicalState = TechnicalStateEnum.DOOR_CLOSED
        this.floorRange = floorRange

    }

    destroy() {
        this.isDestroyed = true;
        this.cleanup()
    } 

    switchPrincipalState(state: PrincipalStateEnum) {
        this.emit(ElevatorEventsEnum.PRINCIPAL_STATE_CHANGE, state)
        let newState: State;
        if (state === PrincipalStateEnum.DESIGNATED_UP) {
            newState = new DesignatedUpState(this)
        } else if (state === PrincipalStateEnum.DESIGNATED_DOWN) {
            newState = new DesignatedDownState(this)
        } else {
            newState = new IdleState(this)
        }
        this.principalState = newState;
        this.principalState.run()
    }

    chooseFloor(floor: number) {

        this.principalState.chooseFloor(floor);
    }

    orderUp(floor: number) {

        this.principalState.orderUp(floor);
    }

    orderDown(floor: number) {
        this.principalState.orderDown(floor);
    }
    emitEvent(event: string, data?: any) {
        this.emit(event, data)
    }
}

