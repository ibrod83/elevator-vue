import { Door } from "../Door/Door";
import { DoorEventsEnum } from "../Door/types";
import { EventEmitter } from "../EventEmitter"
import { ElevatorEventsEnum, StateEnum, DesignatedDirectionEnum, type ElevatorConfig, RequestTypeEnum, DirectionsEnum } from "./types"
import { delay, createDeferred, type Deferred, hasLowerOrHigherNumber, hasHigher, hasLower } from "./utils"



export class Elevator extends EventEmitter {

    private designatedDirection: DesignatedDirectionEnum;// the designated direction(up,down,idle), according to the state of the floorHashmap
    private state!: StateEnum// The technical state of the elevator
    private doorTimerDelay: number
    private travelDelay: number
    private doorTimer: NodeJS.Timeout | null = null
    private isDestroyed: boolean = false
    private currentFloor = 0
    private floorsOrderedDown: number[] = []
    private floorsOrderedUp: number[] = []
    private selectedFloors: number[] = []
    private floorRange: number[] = []
    private door!: Door

    constructor(config: ElevatorConfig) {
        super()
        const { floorRange, travelDelay = 1000, doorTimerDelay = 1000, completeDoorCycleTime = 1000,doorSteps=100 } = config
        this.door = new Door({completeDoorCycleTime,doorSteps})
        this.registerDoorEvents()
        this.doorTimerDelay = doorTimerDelay
        this.floorRange = floorRange
        this.travelDelay = travelDelay
        this.designatedDirection = DesignatedDirectionEnum.IDLE
        this.state = StateEnum.DOOR_CLOSED
    }

    private registerDoorEvents() {
        this.door.on(DoorEventsEnum.DOOR_CLOSED, () => {
            this.emit(ElevatorEventsEnum.DOOR_CLOSED)
            this.setState(StateEnum.DOOR_CLOSED)
            this.triggerCheck()
        })

        this.door.on(DoorEventsEnum.DOOR_OPENED, () => {//
            this.setState(StateEnum.DOOR_OPEN)
            this.emit(ElevatorEventsEnum.DOOR_OPENED)
            this.doorTimer = setTimeout(this._closeDoor, this.doorTimerDelay)
        })

        this.door.on(DoorEventsEnum.DOOR_STATE_PERCENTAGE, (percentage) => {//
            
            this.emit(ElevatorEventsEnum.DOOR_STATE_PERCENTAGE,percentage)
            
        })


    }

    private hasLowerOrHigherFloor(higher: boolean) {
        return hasLowerOrHigherNumber(this.currentFloor, higher, this.floorsOrderedDown, this.floorsOrderedUp, this.selectedFloors)
    }

    private hasHigher() {
        return hasHigher(this.currentFloor, this.floorsOrderedDown, this.floorsOrderedUp, this.selectedFloors)
    }

    private hasLower() {
        return hasLower(this.currentFloor, this.floorsOrderedDown, this.floorsOrderedUp, this.selectedFloors)
    }


    private handleDesignatedDirection() {
        // if(!this.hasFinishedCycle){
        //     return;
        // }
        if (this.hasLowerOrHigherFloor(true)) {
            this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_UP);
        } else if (this.hasLowerOrHigherFloor(false)) {
            this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_DOWN);
        } else {
            this.setDesignatedDirection(DesignatedDirectionEnum.IDLE);
        }
    }

    private async runElevatorInDirection(direction: DirectionsEnum) {
        const isMovingUp = direction === DirectionsEnum.UP;

        while ((isMovingUp ? this.hasHigher() : this.hasLower()) && !this.isDestroyed) {

            // this.hasFinishedCycle = false
            this.setState(StateEnum.MOVING)
            const nextFloor = this.currentFloor + (isMovingUp ? 1 : -1);
            await delay(this.travelDelay);

            this.currentFloor = nextFloor;
            this.emit(ElevatorEventsEnum.CURRENT_FLOOR, nextFloor);

            const isFloorSpecificallySelected = this.selectedFloors.includes(this.currentFloor)
            const isFloorOrderedUp = this.floorsOrderedUp.includes(this.currentFloor)
            const isFloorOrderedDown = this.floorsOrderedDown.includes(this.currentFloor)
            const isFloorFlagged = isFloorOrderedDown || isFloorOrderedUp || isFloorSpecificallySelected
            const isFloorOrderedForCurrentDirection = direction === DirectionsEnum.UP ? isFloorOrderedUp : isFloorOrderedDown

            let shouldStop = false
            const hasMoreFloorsInRelevantDirection = isMovingUp ? this.hasHigher() : this.hasLower()
            if (isFloorFlagged) {
                const hasMoreFloorsInRelevantDirection = isMovingUp ? this.hasHigher() : this.hasLower()
                if (!hasMoreFloorsInRelevantDirection || isFloorOrderedForCurrentDirection || isFloorSpecificallySelected) {
                    shouldStop = true;
                }
            }
            if (shouldStop) {
                if (!hasMoreFloorsInRelevantDirection) {
                    this.handleDesignatedDirection()
                }
                this.handleStopAtFloor(this.currentFloor);

                break;

            }
        }
        // this.handleStopAtFloor(this.currentFloor);
        // this.handleDesignatedDirection()
        // this.handleDesignatedDirection();
        // this.handleEdgeFloor(this.currentFloor);
    }




    private async handleStopAtFloor(floor: number) {

        const filterFunc = (f: number) => f !== floor
        this.selectedFloors = this.selectedFloors.filter(filterFunc)
        this.floorsOrderedDown = this.floorsOrderedDown.filter(filterFunc)
        this.floorsOrderedUp = this.floorsOrderedUp.filter(filterFunc)

        this.emit(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.selectedFloors)
        this.emit(ElevatorEventsEnum.CURRENT_FLOOR, this.currentFloor)
        this.emit(ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, this.floorsOrderedDown)
        this.emit(ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, this.floorsOrderedUp)
        this.emit(ElevatorEventsEnum.STOPPING_AT_FLOOR, this.currentFloor)

        this._openDoor()
    }



    private designationCheck(floor: number) {
        if (this.designatedDirection !== DesignatedDirectionEnum.IDLE) {
            return;
        }
        if (floor > this.currentFloor) {

            this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_UP)
        } else {
            this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_DOWN)
        }
    }

    private triggerCheck() {
        if (this.state === StateEnum.DOOR_CLOSED) {
            if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP && this.hasHigher()) {
                this.runElevatorInDirection(DirectionsEnum.UP);
            } else if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN && this.hasLower()) {
                this.runElevatorInDirection(DirectionsEnum.DOWN);
            } else {
                //IDLE designatedDirection, do nothing
            }
        }
    }


    private setDesignatedDirection(state: DesignatedDirectionEnum) {
        if (state === this.designatedDirection) {
            return;
        }
        this.designatedDirection = state;
        this.emit(ElevatorEventsEnum.DESIGNATION_CHANGE, state)
        // this.run();
    }

    private setState(state: StateEnum) {
        if (state === this.state) {
            return;
        }
        this.state = state;
        this.emit(ElevatorEventsEnum.STATE_CHANGE, state)
    }



    private handleExternalOrder = (floor: number, requestDirection: DirectionsEnum) => {
        //    this.handleSameFloor(floor);
        if (floor === this.currentFloor) {
            if ([StateEnum.DOOR_OPENING, StateEnum.DOOR_CLOSING, StateEnum.DOOR_OPEN, StateEnum.DOOR_CLOSED].includes(this.state)) {
                return;
            }
            //ignore: DOOR_OPENING,DOOR_CLOSING,DOOR_OPEN,DOOR_CLOSED
        }
        const arrayToUpdate = requestDirection === DirectionsEnum.DOWN ? this.floorsOrderedDown : this.floorsOrderedUp
        arrayToUpdate.push(floor)

        // this.floorHashmap[floor].push(RequestTypeEnum[requestDirection])
        this.emit(requestDirection === DirectionsEnum.DOWN ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, arrayToUpdate)
        this.designationCheck(floor)
        this.triggerCheck()

    }

    chooseFloor = (floor: number) => {
        if (floor === this.currentFloor) {
            if ([StateEnum.DOOR_OPENING, StateEnum.DOOR_CLOSING, StateEnum.DOOR_OPEN, StateEnum.DOOR_CLOSED].includes(this.state)) {
                return;
            }
            //ignore: DOOR_OPENING,DOOR_CLOSING,DOOR_OPEN,DOOR_CLOSED
        }
        this.selectedFloors.push(floor)
        this.emit(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.selectedFloors)
        this.designationCheck(floor)
        this.triggerCheck()
    }

    destroy() {
        this.isDestroyed = true;
        this.cleanup()
        this.clearDoorTimer()
        this.door.cleanup()
    }



    orderUp(floor: number) {
        this.handleExternalOrder(floor, DirectionsEnum.UP)
    }

    orderDown(floor: number) {
        this.handleExternalOrder(floor, DirectionsEnum.DOWN)
    }



    private clearDoorTimer() {
        if (!this.doorTimer) {
            return;
        }
        clearTimeout(this.doorTimer)
    }

    //imperative actions used by the class
    private async _openDoor() {
        this.clearDoorTimer()
        // this.resetDoorTimer();
        if (this.state === StateEnum.DOOR_CLOSING) {
            // this.closeDoorCancelationPromise.resolve('CANCEL')
            
            this.emit(ElevatorEventsEnum.DOOR_CLOSING_CANCELED)
        }

        this.door.open()

        this.emit(ElevatorEventsEnum.DOOR_OPENING)
        this.setState(StateEnum.DOOR_OPENING)

       
    }

    private _closeDoor = async () => {
        this.clearDoorTimer()
        this.emit(ElevatorEventsEnum.DOOR_CLOSING)
        this.setState(StateEnum.DOOR_CLOSING)
        this.door.close()
    }

    openDoor() {
        const relevantStates = [StateEnum.DOOR_CLOSING, StateEnum.DOOR_CLOSED]
        if (relevantStates.includes(this.state)) {
            this._openDoor()
        }
    }

    closeDoor() {
        const relevantStates = [StateEnum.DOOR_OPEN]//
        if (relevantStates.includes(this.state)) {
            this._closeDoor()
        }
    }
}
