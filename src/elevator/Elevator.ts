import { EventEmitter } from "./EventEmitter"
import { ElevatorEventsEnum, StateEnum, DesignatedDirectionEnum, type ElevatorConfig, RequestTypeEnum, DirectionsEnum } from "./types"
import { delay, createDeferred, type Deferred, hasLowerOrHigherFloor } from "./utils"



export class Elevator extends EventEmitter {
    private designatedDirection: DesignatedDirectionEnum;// the designated direction(up,down,idle), according to the state of the floorHashmap
    private state!: StateEnum// The technical state of the elevator
    private floorHashmap: { [index: number]: RequestTypeEnum | null } = {}
    private closeDoorDelay: number
    private openDoorDelay: number
    private travelDelay: number
    private closeDoorCancelationPromise!: Deferred<any>
    private isDestroyed: boolean = false
    private currentFloor = 0
    private floorsOrderedDown: number[] = []
    private floorsOrderedUp: number[] = []
    private selectedFloors: number[] = []

    constructor(config: ElevatorConfig) {
        super()
        const { floorRange, closeDoorDelay,openDoorDelay, travelDelay } = config
        this.closeDoorDelay = closeDoorDelay
        this.openDoorDelay =openDoorDelay
        this.travelDelay = travelDelay
        this.designatedDirection = DesignatedDirectionEnum.NONE
        this.state = StateEnum.READY_FOR_MOVEMENT

        for (let i = floorRange[0]; i < floorRange[1]; i++) {
            this.floorHashmap[i] = null
        }
        // this.pollForReady()

    }

    // private async pollForReady() {
    //     while (!this.isDestroyed) {

    //         if (this.state === StateEnum.READY_FOR_MOVEMENT) {
    //             if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP) {
    //                 this.runElevatorInDirection(DirectionsEnum.UP);
    //             } else if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN) {
    //                 this.runElevatorInDirection(DirectionsEnum.DOWN);
    //             } else {
    //                 //IDLE designatedDirection, do nothing
    //             }
    //         }

    //         await delay(25)
    //     }
    // }


    private handleDesignatedDirection() {
        if (hasLowerOrHigherFloor(this.floorHashmap, this.currentFloor, true)) {
            this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_UP);
        } else if (hasLowerOrHigherFloor(this.floorHashmap, this.currentFloor, false)) {
            this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_DOWN);
        } else {
            this.setDesignatedDirection(DesignatedDirectionEnum.NONE);
        }
    }

    private async runElevatorInDirection(direction: DirectionsEnum) {
        const isMovingUp = direction === DirectionsEnum.UP;
        const LowerOrHigher = isMovingUp ? true : false

        while (hasLowerOrHigherFloor(this.floorHashmap, this.currentFloor, LowerOrHigher) && !this.isDestroyed) {
            this.setState(StateEnum.MOVING)
            const nextFloor = this.currentFloor + (isMovingUp ? 1 : -1);
            await delay(this.travelDelay);

            this.currentFloor = nextFloor;
            this.emit(ElevatorEventsEnum.CURRENT_FLOOR, nextFloor);

            const currentFloorFlag = this.floorHashmap[this.currentFloor]
            const isFloorFlagged = currentFloorFlag !== null;

            let shouldStop = false
            if (isFloorFlagged) {
                const hasMoreFloorsInRelevantDirection = hasLowerOrHigherFloor(this.floorHashmap, this.currentFloor, LowerOrHigher)
                if (!hasMoreFloorsInRelevantDirection || currentFloorFlag === RequestTypeEnum[direction] || currentFloorFlag === RequestTypeEnum.SPECIFIC) {
                    shouldStop = true;
                }
            }
            if (shouldStop) {
                // this.handleStopAtFloor(this.currentFloor);
                break;
                // await delay(this.stopDelay);
            }
        }
        this.handleStopAtFloor(this.currentFloor);
        this.handleDesignatedDirection()
        // this.handleDesignatedDirection();
        // this.handleEdgeFloor(this.currentFloor);
    }


    private async handleStopAtFloor(floor: number) {
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

        await this._openDoor()//the await is FAKE
        this._closeDoor()//FAKE
        // this.setState(StateEnum.DOOR_OPENING)
        // await delay(this.stopDelay / 3);
        // this.setState(StateEnum.DOOR_OPEN)
        // await delay(this.stopDelay / 3);
        // this.setState(StateEnum.DOOR_CLOSING)//fake
        // await delay(this.stopDelay / 3);


        // this.setState(StateEnum.READY_FOR_MOVEMENT)//FAKE for noe

    }

    private withDesignationAndTriggerCheck<T>(func: Function) {
        return this.withTriggerCheck(this.withDesignationCheck(func));
    }
    

    private  withTriggerCheck<T>(func: Function) {
        return async(...args: T[]) => {
            await func(...args)
            if (this.state === StateEnum.READY_FOR_MOVEMENT) {
                if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP) {
                    this.runElevatorInDirection(DirectionsEnum.UP);
                } else if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN) {
                    this.runElevatorInDirection(DirectionsEnum.DOWN);
                } else {
                    //IDLE designatedDirection, do nothing
                }
            }
        }
    }

    private withDesignationCheck<T>(func: Function) {
        return (floor: number, ...rest: T[]) => {
            func(floor, ...rest)
            if (this.designatedDirection !== DesignatedDirectionEnum.NONE) {
                return;
            }
            if (floor > this.currentFloor) {

                this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_UP)
            } else {
                this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_DOWN)
            }
        }
    }


    private setDesignatedDirection(state: DesignatedDirectionEnum) {
        if (state === this.designatedDirection) {
            return;
        }
        this.designatedDirection = state;
        this.emit(ElevatorEventsEnum.PRINCIPAL_STATE_CHANGE, state)
        // this.run();
    }

    private setState(state: StateEnum) {
        if (state === this.state) {
            return;
        }
        this.state = state;
        this.emit(ElevatorEventsEnum.STATE_CHANGE, state)
    }

    private handleExternalOrder = this.withDesignationAndTriggerCheck((floor: number, requestDirection: DirectionsEnum) => {
        if (floor === this.currentFloor) {
            return;
        }
        const arrayToUpdate = requestDirection === DirectionsEnum.DOWN ? this.floorsOrderedDown : this.floorsOrderedUp
        arrayToUpdate.push(floor)

        this.floorHashmap[floor] = RequestTypeEnum[requestDirection]
        this.emit(requestDirection === DirectionsEnum.DOWN ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, arrayToUpdate)
    })

    chooseFloor = this.withDesignationAndTriggerCheck((floor: number) => {
        if (this.selectedFloors.includes(floor) || floor === this.currentFloor) {
            return
        }
        this.floorHashmap[floor] = RequestTypeEnum.SPECIFIC
        this.selectedFloors.push(floor)
        this.emit(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.selectedFloors)
    })

    destroy() {
        this.isDestroyed = true;
        this.cleanup()
    }



    orderUp(floor: number) {
        this.handleExternalOrder(floor, DirectionsEnum.UP)
    }

    orderDown(floor: number) {
        this.handleExternalOrder(floor, DirectionsEnum.DOWN)
    }

    //imperative actions used by the class
    private async _openDoor() {
        if (this.state === StateEnum.DOOR_CLOSING) {
            this.closeDoorCancelationPromise.resolve('CANCEL')
        }

        this.emit(ElevatorEventsEnum.DOOR_OPENING)
        this.setState(StateEnum.DOOR_OPENING)
        // console.log('Door is opening')
        await delay(this.openDoorDelay)
        // console.log('Door opened')        
        this.setState(StateEnum.DOOR_OPEN)
        this.emit(ElevatorEventsEnum.DOOR_OPENED)
    }

    private _closeDoor = this.withTriggerCheck(async ()=> {
        this.emit(ElevatorEventsEnum.DOOR_CLOSING)
        // console.log('Door is closing')

        this.closeDoorCancelationPromise = createDeferred()
        const mockDoorClosePromise = delay(this.closeDoorDelay)
        this.setState(StateEnum.DOOR_CLOSING)
        const raceResult = await Promise.race([mockDoorClosePromise, this.closeDoorCancelationPromise.promise])
        if (raceResult === 'CANCEL') {
            // console.log('Door closing canceled')
            this.emit(ElevatorEventsEnum.DOOR_CLOSING_CANCELED)
        } else {
            // console.log('Door closed')
            this.emit(ElevatorEventsEnum.DOOR_CLOSED)
            this.setState(StateEnum.READY_FOR_MOVEMENT)
            // this._digest()
        }
    })

    openDoor() {
        const relevantStates = [StateEnum.DOOR_CLOSING, StateEnum.DOOR_CLOSED]
        if (relevantStates.includes(this.state)) {
            this._openDoor()
        }
    }

    closeDoor() {
        const relevantStates = [StateEnum.DOOR_OPEN]
        if (relevantStates.includes(this.state)) {
            this._closeDoor()
        }
    }



    // Additional methods for handling elevator logic...


    // Any additional helper methods, cleanup methods, etc.
}
