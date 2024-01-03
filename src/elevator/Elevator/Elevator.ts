import { Door } from "../Door/Door";
import { DoorEventsEnum } from "../Door/types";
import { EventEmitter } from "../EventEmitter"
import { ElevatorEventsEnum, StateEnum, DesignatedDirectionEnum, type ElevatorConfig, RequestTypeEnum, DirectionsEnum } from "./types"
import { delay, hasHigher, hasLower } from "./utils"

export class Elevator extends EventEmitter {

    private doorTimerDelay: number
    private travelDelay: number
    private doorTimer: NodeJS.Timeout | null = null
    private isDestroyed: boolean = false
    private door!: Door
    private floorsOrderedDown: number[] = []
    private floorsOrderedUp: number[] = []
    private selectedFloors: number[] = []
    public state!: StateEnum// The technical state of the elevator
    public currentFloor = 0//
    public designatedDirection: DesignatedDirectionEnum;// the designated direction(up,down,idle), according to the state of the floorHashmap
    public floorRange: number[] = []
    public id: number
    constructor(config: ElevatorConfig) {
        super()
        const { floorRange, id, travelDelay = 1000, doorTimerDelay = 1000, completeDoorCycleTime = 1000, doorSteps = 100 } = config
        this.door = new Door({ completeDoorCycleTime, doorSteps })
        this.id = id;
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
            this.switchDirectionIfNeeded()
            this.triggerCheck()
        })

        this.door.on(DoorEventsEnum.DOOR_OPENED, () => {//
            this.setState(StateEnum.DOOR_OPEN)
            this.emit(ElevatorEventsEnum.DOOR_OPENED)
            this.doorTimer = setTimeout(this._closeDoor, this.doorTimerDelay)
        })

        this.door.on(DoorEventsEnum.DOOR_STATE_PERCENTAGE, (percentage) => {//            
            this.emit(ElevatorEventsEnum.DOOR_STATE_PERCENTAGE, percentage)
        })
    }

    private hasHigher() {
        return hasHigher(this.currentFloor, this.floorsOrderedDown, this.floorsOrderedUp, this.selectedFloors)
    }

    private hasLower() {
        return hasLower(this.currentFloor, this.floorsOrderedDown, this.floorsOrderedUp, this.selectedFloors)
    }

    private switchDirectionIfNeeded() {

        const hasHigher = this.hasHigher()
        const hasLower = this.hasLower()

        if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP && hasHigher ||
            this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN && hasLower) {
            return;
        }

        if (hasHigher) {
            this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_UP);
        } else if (hasLower) {
            this.setDesignatedDirection(DesignatedDirectionEnum.DESIGNATED_DOWN);
        } else {

            this.setDesignatedDirection(DesignatedDirectionEnum.IDLE);
        }
    }

    private async runElevatorInDirection(direction: DirectionsEnum) {

        const isMovingUp = direction === DirectionsEnum.UP;

        let isFloorSpecificallySelected = false
        let isFloorOrderedForCurrentDirection = false
        let isFloorOrderedToOppositeDirection = false
        let isFloorOrderedUp = false
        let isFloorOrderedDown = false

        while (!this.isDestroyed) {
            this.setState(StateEnum.MOVING)
            const nextFloor = this.currentFloor + (isMovingUp ? 1 : -1);
            await delay(this.travelDelay);

            this.currentFloor = nextFloor;
            this.emit(ElevatorEventsEnum.CURRENT_FLOOR, nextFloor);

            isFloorOrderedUp = this.floorsOrderedUp.includes(this.currentFloor)
            isFloorOrderedDown = this.floorsOrderedDown.includes(this.currentFloor)
            isFloorSpecificallySelected = this.selectedFloors.includes(this.currentFloor)
            isFloorOrderedForCurrentDirection = direction === DirectionsEnum.UP ? isFloorOrderedUp : isFloorOrderedDown
            isFloorOrderedToOppositeDirection = direction === DirectionsEnum.UP ? isFloorOrderedDown : isFloorOrderedUp

            const isFloorFlagged = isFloorOrderedDown || isFloorOrderedUp || isFloorSpecificallySelected
            const hasHigher = this.hasHigher()
            const hasLower = this.hasLower()
            const hasMoreInRelevantDirection = isMovingUp ? hasHigher : hasLower
            const stop = ()=>this.handleStopAtFloor(this.currentFloor, isFloorOrderedForCurrentDirection, isFloorOrderedToOppositeDirection, isFloorOrderedUp, hasHigher, hasLower); 

            if (isFloorFlagged && (isFloorOrderedForCurrentDirection || isFloorSpecificallySelected)) {
                return stop()
            }
            if (!hasMoreInRelevantDirection) {
                return stop()
            }
            // Else, continue..
        }
    }

    private async handleStopAtFloor(floor: number,
        isFloorOrderedForCurrentDirection: boolean,
        isFloorOrderedToOppositeDirection: boolean,
        isFloorOrderedUp: boolean,
        hasHigher: boolean,
        hasLower: boolean
    ) {

        const filterFunc = (f: number) => f !== floor

        const filterCorrectOrdersArray = ((isFloorOrderedUp: boolean) => {            
            if (isFloorOrderedUp) {
                this.floorsOrderedUp = this.floorsOrderedUp.filter(filterFunc)
            } else {
                this.floorsOrderedDown = this.floorsOrderedDown.filter(filterFunc)
            }
        })

        // Always clear selected floors from within the elevator
        this.selectedFloors = this.selectedFloors.filter(filterFunc)

        this._openDoor()

        if (isFloorOrderedForCurrentDirection) {

            // Both directions
            if (isFloorOrderedToOppositeDirection) {
                //Clear both orders for simplicity
                this.floorsOrderedUp = this.floorsOrderedUp.filter(filterFunc)
                this.floorsOrderedDown = this.floorsOrderedDown.filter(filterFunc)
                //Continue at the same direction
                if (!hasHigher && !hasLower) {
                    this.setDesignatedDirection(DesignatedDirectionEnum.IDLE)
                }
            }
            // Only current direction
            if (!isFloorOrderedToOppositeDirection) {
                filterCorrectOrdersArray(isFloorOrderedUp)

            }
        } else {

            // Only opposite direction
            if (isFloorOrderedToOppositeDirection) {
                const oppositeDirection = this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP ? DesignatedDirectionEnum.DESIGNATED_DOWN :
                    DesignatedDirectionEnum.DESIGNATED_UP
                filterCorrectOrdersArray(isFloorOrderedUp)
                this.setDesignatedDirection(oppositeDirection)
            } else {
                this.switchDirectionIfNeeded()
            }
        }

        this.emitStopAtFloorEvents()
    }


    private emitStopAtFloorEvents() {
        this.emit(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.selectedFloors)
        this.emit(ElevatorEventsEnum.CURRENT_FLOOR, this.currentFloor)
        this.emit(ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, this.floorsOrderedDown)
        this.emit(ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, this.floorsOrderedUp)
        this.emit(ElevatorEventsEnum.STOPPING_AT_FLOOR, this.currentFloor)
    }


    private triggerCheck() {
        if (this.state === StateEnum.DOOR_CLOSED) {
            if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP) {
                this.runElevatorInDirection(DirectionsEnum.UP);
            } else if (this.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN) {
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
    }

    private setState(state: StateEnum) {
        if (state === this.state) {
            return;
        }
        this.state = state;
        this.emit(ElevatorEventsEnum.STATE_CHANGE, state)
    }

    private clearDoorTimer() {
        if (!this.doorTimer) {
            return;
        }
        clearTimeout(this.doorTimer)
    }

    private async _openDoor() {
        this.clearDoorTimer()
        if (this.state === StateEnum.DOOR_CLOSING) {
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


    /**
     * Being that the elevator is 100% indepedent, it needs to return a boolean to the client(the Dispatcher), 
     * notfying whether the order was accepted
     */
    private handleExternalOrder = (floor: number, requestDirection: DirectionsEnum): boolean => {
        if (floor === this.currentFloor) {
            if (this.state === StateEnum.DOOR_CLOSED) {//
                this._openDoor()
                return false;
            }
            if (this.state === StateEnum.DOOR_OPENING || this.state === StateEnum.DOOR_CLOSING || this.state === StateEnum.DOOR_OPEN) {
                return false;
            }
        }
        const arrayToUpdate = requestDirection === DirectionsEnum.DOWN ? this.floorsOrderedDown : this.floorsOrderedUp
        arrayToUpdate.push(floor)

        this.emit(requestDirection === DirectionsEnum.DOWN ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, arrayToUpdate)
        if (StateEnum.DOOR_CLOSED === this.state) {
            this.switchDirectionIfNeeded()
            this.triggerCheck()
        }
        return true

    }

    chooseFloor = (floor: number) => {
        if (floor === this.currentFloor) {
            if ([StateEnum.DOOR_OPENING, StateEnum.DOOR_CLOSING, StateEnum.DOOR_OPEN, StateEnum.DOOR_CLOSED].includes(this.state)) {
                return;
            }
        }
        this.selectedFloors.push(floor)
        this.emit(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, this.selectedFloors)
        if (StateEnum.DOOR_CLOSED === this.state) {
            this.switchDirectionIfNeeded()
            this.triggerCheck()
        }

    }   

    destroy() {
        this.isDestroyed = true;
        this.cleanup()
        this.clearDoorTimer()
        this.door.cleanup()
    }

    orderUp(floor: number) {
        return this.handleExternalOrder(floor, DirectionsEnum.UP)
    }

    orderDown(floor: number) {
        return this.handleExternalOrder(floor, DirectionsEnum.DOWN)
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