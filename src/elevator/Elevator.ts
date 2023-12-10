import { EventEmitter } from "./EventEmitter"
import { ElevatorEventsEnum, TechnicalStateEnum, PrincipalStateEnum, type ElevatorConfig, type ElevatorTrackingState, } from "./types"
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
    downQueue = new PriorityQueueWrapper(true, function (a: number, b: number) { return b - a; });
    upQueue = new PriorityQueueWrapper(true, function (a: number, b: number) { return a - b; });
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



// import { EventEmitter } from "./EventEmitter"
// import { ElevatorEventsEnum, TechnicalStateEnum, PrincipalStateEnum, type ElevatorConfig, type ElevatorTrackingState, } from "./types"
// import { delay, type Deferred, createDeferred } from "./utils"
// import { PriorityQueueWrapper } from "./PriorityQueueWrapper"
// import PriorityQueue from "js-priority-queue"
// import type { State } from "./states/State"
// import { DesignatedUpState } from "./states/DesignatedUpState"
// import { DesignatedDownState } from "./states/DesignatedDownState"
// import { IdleState } from "./states/IdleState"



// export class Elevator extends EventEmitter {
//     private principalState: State;

//     technicalState!: TechnicalStateEnum
//     downQueue = new PriorityQueueWrapper(true, function (a: number, b: number) { return b - a; });
//     upQueue = new PriorityQueueWrapper(true, function (a: number, b: number) { return a - b; });

//     floorRange: number[] = []
//     stopDelay: number
//     travelDelay: number
//     closeDoorCancelationPromise!: Deferred<any>
//     movementInterval!: string
//     isDestroyed: boolean = false

//     selectedFloors:Array<number>= []
//     floorsOrderedUp:Array<number>= []
//     floorsOrderedDown:Array<number>= []
//     currentFloor =0



//     constructor(config: ElevatorConfig) {
//         super()
//         const { floorRange, stopDelay, travelDelay } = config
//         this.stopDelay = stopDelay
//         this.travelDelay = travelDelay
//         this.principalState = new IdleState(this)
//         this.technicalState = TechnicalStateEnum.DOOR_CLOSED
//         this.floorRange = floorRange

//     }

//     destroy() {
//         this.isDestroyed = true;
//         this.cleanup()
//     }

 

//     switchPrincipalState(state: PrincipalStateEnum) {
//         // if (state !== this.principalState) {
//         this.emit(ElevatorEventsEnum.PRINCIPAL_STATE_CHANGE, state)
//         let newState: State;
//         if (state === PrincipalStateEnum.DESIGNATED_UP) {
//             newState = new DesignatedUpState(this)
//         } else if (state === PrincipalStateEnum.DESIGNATED_DOWN) {
//             newState = new DesignatedDownState(this)
//         } else {
//             newState = new IdleState(this)
//         }
//         this.principalState = newState;
//         this.principalState.run()
//         // }

//     }

//     // private switchTechnicalState(state: TechnicalStateEnum) {
//     //     if (state !== this.technicalState) {
//     //         this.emit(ElevatorEventsEnum.TECHNICAL_STATE_CHANGE, state)
//     //         this.technicalState = state
//     //     }

//     // }


//     // //imperative actions used by the class
//     // private async _openDoor() {
//     //     if (this.technicalState === TechnicalStateEnum.DOOR_CLOSING) {
//     //         this.closeDoorCancelationPromise.resolve('CANCEL')
//     //     }

//     //     this.emit(ElevatorEventsEnum.DOOR_OPENING)
//     //     this.switchTechnicalState(TechnicalStateEnum.DOOR_OPENING)
//     //     // console.log('Door is opening')
//     //     await delay(3000)
//     //     // console.log('Door opened')        
//     //     this.switchTechnicalState(TechnicalStateEnum.DOOR_OPEN)
//     //     this.emit(ElevatorEventsEnum.DOOR_OPENED)
//     // }

//     // private async _closeDoor() {
//     //     this.emit(ElevatorEventsEnum.DOOR_CLOSING)
//     //     // console.log('Door is closing')

//     //     this.closeDoorCancelationPromise = createDeferred()
//     //     const mockDoorClosePromise = delay(3000)
//     //     this.switchTechnicalState(TechnicalStateEnum.DOOR_CLOSING)
//     //     const raceResult = await Promise.race([mockDoorClosePromise, this.closeDoorCancelationPromise.promise])
//     //     if (raceResult === 'CANCEL') {
//     //         // console.log('Door closing canceled')
//     //         this.emit(ElevatorEventsEnum.DOOR_CLOSING_CANCELED)
//     //     } else {
//     //         // console.log('Door closed')
//     //         this.emit(ElevatorEventsEnum.DOOR_CLOSED)
//     //         this.switchTechnicalState(TechnicalStateEnum.DOOR_CLOSED)
//     //         // this._digest()
//     //     }
//     // }

//     // openDoor() {
//     //     const relevantStates = [TechnicalStateEnum.DOOR_CLOSED, TechnicalStateEnum.DOOR_CLOSING]
//     //     if (relevantStates.includes(this.technicalState)) {
//     //         this._openDoor()
//     //     }
//     // }

//     // closeDoor() {
//     //     const relevantStates = [TechnicalStateEnum.DOOR_OPEN]
//     //     if (relevantStates.includes(this.technicalState)) {
//     //         this._closeDoor()
//     //     }
//     // }

    


//     chooseFloor(floor: number) {
//         // if (!this.selectedFloors.includes(floor)) {
//         //     this.selectedFloors.push(floor)
//         //     this.emit('SELECTED_FLOORS_CHANGED', this.selectedFloors)
//         // }
//         this.principalState.chooseFloor(floor);
//     }

//     orderUp(floor: number) {

//         this.principalState.orderUp(floor);
//     }

//     orderDown(floor: number) {
//         this.principalState.orderDown(floor);
//     }

//     // openDoor() {
//     //     this.principalState.openDoor();
//     // }

//     // closeDoor() {
//     //     this.principalState.closeDoor();
//     // }

//     emitEvent(event: string, data?: any) {
//         this.emit(event, data)
//     }








// }