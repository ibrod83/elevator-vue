import { EventEmitter } from "./EventEmitter"
import { ElevatorEventsEnum, TechnicalStateEnum, PrincipalStateEnum, } from "./types"
import { delay, type Deferred, createDeferred } from "./utils"
import { PriorityQueueWrapper } from "./PriorityQueueWrapper"
import PriorityQueue from "js-priority-queue"



export class Elevator extends EventEmitter {
    private principalState!: PrincipalStateEnum
    private technicalState!: TechnicalStateEnum
    private chosenFloorsFromElevator: Set<number> = new Set()
    downQueue = new PriorityQueueWrapper(true, function (a: number, b: number) { return b - a; });
    upQueue = new PriorityQueueWrapper(true, function (a: number, b: number) { return a - b; });
    // downQueue = new PriorityQueue( {comparator:function (a: number, b: number) { return b - a; }});
    // upQueue = new PriorityQueue( {comparator:function (a: number, b: number) { return a-b; }});
    private floorRange: number[] = []
    private currentFloor: number = 0
    private closeDoorCancelationPromise!: Deferred<any>
    private movementInterval!: string
    private isDestroyed: boolean = false
    // private waitForIdleStateChangeTimeout:string

    constructor(floorRange: number[]) {
        super()
        this.principalState = PrincipalStateEnum.IDLE
        this.technicalState = TechnicalStateEnum.DOOR_CLOSED
        this.floorRange = floorRange

    }

    destroy() {
        this.isDestroyed = true;
        this.cleanup()
    }



    async processDownState() {
        while (this.downQueue.length) {
            // await delay(2000) // This line is commented out as in processUpState
            const nextFloor = this.currentFloor - 1;
            const nextFloorToStop = this.downQueue.peek();
            await delay(500);
            this.emit(ElevatorEventsEnum.CURRENT_FLOOR, nextFloor);

            this.currentFloor = nextFloor;
            if (nextFloor === nextFloorToStop) {
                this.downQueue.dequeue();
                this.emit(ElevatorEventsEnum.STOPPING_AT_FLOOR, nextFloorToStop)
                await delay(3000); // Simulate the time taken to stop at a floor
            }
        }
        const newState = this.upQueue.length ? PrincipalStateEnum.DESIGNATED_UP : PrincipalStateEnum.IDLE;
        this.emit(ElevatorEventsEnum.DOWN_QUEUE_FINISHED);
        this.switchPrincipalState(newState);
    }


    async processUpState() {
        while (this.upQueue.length) {
            // await delay(2000)
            const nextFloor = this.currentFloor + 1
            const nextFloorToStop = this.upQueue.peek()
            await delay(500);
            this.emit(ElevatorEventsEnum.CURRENT_FLOOR, nextFloor)

            this.currentFloor = nextFloor
            if (nextFloor === nextFloorToStop) {
                this.emit(ElevatorEventsEnum.STOPPING_AT_FLOOR, nextFloorToStop)

                this.upQueue.dequeue()
                await delay(1500)

            }

        }
        const newState = this.downQueue.length ? PrincipalStateEnum.DESIGNATED_DOWN : PrincipalStateEnum.IDLE
        this.emit(ElevatorEventsEnum.UP_QUEUE_FINISHED)
        this.switchPrincipalState(newState)

    }

    // async FAKE_goToFloor(){
    //     await delay(1000)
    // }

    // async FAKE_stopAtFloor(floor:number){
    //     this.emit(ElevatorEventsEnum.STOPPING_AT_FLOOR,floor)
    //     await delay(2000)
    // }

    // async processIdleState() {
    //     await delay(0)
    //     if(this.upQueue.length){
    //         this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP)
    //     }

    //     if(this.downQueue.length){
    //         this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN)
    //     }

    // }
    async processIdleState() {
        while (this.principalState === PrincipalStateEnum.IDLE && this.upQueue.length === 0 && this.downQueue.length === 0) {
            await delay(750)
        }
        if (this.upQueue.length) {
            this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP);
        } else if (this.downQueue.length) {
            this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN);
        }
    }





    private switchPrincipalState(state: PrincipalStateEnum) {
        if (state !== this.principalState) {
            this.emit(ElevatorEventsEnum.PRINCIPAL_STATE_CHANGE, state)
            this.principalState = state
        }

    }

    private switchTechnicalState(state: TechnicalStateEnum) {
        if (state !== this.technicalState) {
            this.emit(ElevatorEventsEnum.TECHNICAL_STATE_CHANGE, state)
            this.technicalState = state
        }

    }


    //imperative actions used by the class
    private async _openDoor() {
        if (this.technicalState === TechnicalStateEnum.DOOR_CLOSING) {
            this.closeDoorCancelationPromise.resolve('CANCEL')
        }

        this.emit(ElevatorEventsEnum.DOOR_OPENING)
        this.switchTechnicalState(TechnicalStateEnum.DOOR_OPENING)
        // console.log('Door is opening')
        await delay(3000)
        // console.log('Door opened')        
        this.switchTechnicalState(TechnicalStateEnum.DOOR_OPEN)
        this.emit(ElevatorEventsEnum.DOOR_OPENED)
    }

    private async _closeDoor() {
        this.emit(ElevatorEventsEnum.DOOR_CLOSING)
        // console.log('Door is closing')

        this.closeDoorCancelationPromise = createDeferred()
        const mockDoorClosePromise = delay(3000)
        this.switchTechnicalState(TechnicalStateEnum.DOOR_CLOSING)
        const raceResult = await Promise.race([mockDoorClosePromise, this.closeDoorCancelationPromise.promise])
        if (raceResult === 'CANCEL') {
            // console.log('Door closing canceled')
            this.emit(ElevatorEventsEnum.DOOR_CLOSING_CANCELED)
        } else {
            // console.log('Door closed')
            this.emit(ElevatorEventsEnum.DOOR_CLOSED)
            this.switchTechnicalState(TechnicalStateEnum.DOOR_CLOSED)
            // this._digest()
        }
    }

    openDoor() {
        const relevantStates = [TechnicalStateEnum.DOOR_CLOSED, TechnicalStateEnum.DOOR_CLOSING]
        if (relevantStates.includes(this.technicalState)) {
            this._openDoor()
        }
    }

    closeDoor() {
        const relevantStates = [TechnicalStateEnum.DOOR_OPEN]
        if (relevantStates.includes(this.technicalState)) {
            this._closeDoor()
        }
    }

    chooseFloor(floor: number) {
        
        // console.log(this.currentFloor)
        // console.log(this.downQueue)
        if (floor < this.currentFloor) {
            this.downQueue.queue(floor)
        } else if (floor > this.currentFloor) {
            this.upQueue.queue(floor)
        } else {
            return
        }
        // this.chosenFloorsFromElevator.add(floor)
    }

    orderUp(originFloor: number) {
        this.upQueue.queue(originFloor)
        // this.emit(ElevatorEventsEnum.FLOORS_AWAITING_UP_ADDED, { originFloor })
        // this._digest()
    }

    orderDown(originFloor: number) {
        this.downQueue.queue(originFloor)
        // this.emit(ElevatorEventsEnum.FLOORS_AWAITING_DOWN_ADDED, { originFloor })
        // this._digest()
    }

    async run() {
        while (!this.isDestroyed) {
            switch (this.principalState) {
                case PrincipalStateEnum.DESIGNATED_UP:
                    console.log(`Processing DESIGNATED_UP state`)
                    await this.processUpState()
                    break;
                case PrincipalStateEnum.DESIGNATED_DOWN:
                    console.log(`Processing DESIGNATED_DOWN state`)
                    await this.processDownState()
                    break;
                case PrincipalStateEnum.IDLE:
                    console.log(`Processing IDLE state`)
                    await this.processIdleState()
                    break;
                default:
                    break;
            }
        }
    }








}