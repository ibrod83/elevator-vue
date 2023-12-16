import { EventEmitter } from "./EventEmitter"
import { ElevatorEventsEnum, TechnicalStateEnum, PrincipalStateEnum, type ElevatorConfig, RequestTypeEnum } from "./types"
import { delay, createDeferred, type Deferred, hasLowerOrHigherFloor } from "./utils"



export class Elevator extends EventEmitter {
    private principalState: PrincipalStateEnum;
    private technicalState!: TechnicalStateEnum
    private floorHashmap: { [index: number]: RequestTypeEnum | null } = {}
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
        for (let i = floorRange[0]; i < floorRange[1]; i++) {
            this.floorHashmap[i] = null
        }
    }


    private switchToNextState() {
        if (hasLowerOrHigherFloor(this.floorHashmap, this.currentFloor, true)) {
            this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP);
        } else if (hasLowerOrHigherFloor(this.floorHashmap, this.currentFloor, false)) {
            this.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN);
        } else {
            this.switchPrincipalState(PrincipalStateEnum.IDLE);
        }
    }

    private async runElevatorInDirection(direction: 'UP' | 'DOWN') {
        const isMovingUp = direction === 'UP';    
        const LowerOrHigher = isMovingUp ? true : false
        
        while (hasLowerOrHigherFloor(this.floorHashmap, this.currentFloor, LowerOrHigher) && !this.isDestroyed) {
            const nextFloor = this.currentFloor + (isMovingUp ? 1 : -1);
            await delay(this.travelDelay);

            this.currentFloor = nextFloor;
            this.emit(ElevatorEventsEnum.CURRENT_FLOOR, nextFloor);

            const currentFloorFlag = this.floorHashmap[this.currentFloor]
            const isFloorFlagged = currentFloorFlag !== null;

            let shouldStop = false
            if (isFloorFlagged) {
                const hasMoreFloorsInRelevantDirection = hasLowerOrHigherFloor(this.floorHashmap, this.currentFloor, LowerOrHigher)
                if (!hasMoreFloorsInRelevantDirection || currentFloorFlag === RequestTypeEnum[direction] || currentFloorFlag === RequestTypeEnum.SPECIFIC ){
                    shouldStop = true;
                }
            }         
            if (shouldStop) {
                this.handleStoppedAtFloor(this.currentFloor);
                await delay(this.stopDelay);
            }
        }

        this.switchToNextState();
    }

    private handleStoppedAtFloor(floor: number) {
        const filterFunc = (f: number) => f !== floor
        this.floorHashmap[floor] = null;
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
        return (floor: number, ...rest: any[]) => {
            func(floor, ...rest)
            if (this.principalState !== PrincipalStateEnum.IDLE) {
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

    private handleExternalOrder = this.withIdleCheck((floor: number, requestDirection: 'UP' | 'DOWN') => {
        if (floor === this.currentFloor) {
            return;
        }
        const arrayToUpdate = requestDirection === 'DOWN' ? this.floorsOrderedDown : this.floorsOrderedUp
        arrayToUpdate.push(floor)

        this.floorHashmap[floor] = RequestTypeEnum[requestDirection]
        this.emit(requestDirection === 'DOWN' ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, arrayToUpdate)
    })

    destroy() {
        this.isDestroyed = true;
        this.cleanup()
    }


    chooseFloor = this.withIdleCheck((floor: number) => {
        if (this.selectedFloors.includes(floor) || floor === this.currentFloor) {
            return
        }
        this.floorHashmap[floor] = RequestTypeEnum.SPECIFIC
        this.selectedFloors.push(floor)
        this.emit(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.selectedFloors)
    })


    run() {
        if (this.isDestroyed) return;

        if (this.principalState === PrincipalStateEnum.DESIGNATED_UP) {
            this.runElevatorInDirection('UP');
        } else if (this.principalState === PrincipalStateEnum.DESIGNATED_DOWN) {
            this.runElevatorInDirection('DOWN');
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
