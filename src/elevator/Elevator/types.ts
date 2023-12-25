export enum StateEnum {
    MOVING = 'MOVING',
    DOOR_CLOSED = 'DOOR_CLOSED',   //Once in this state, if there is any designated floor up or down, the elevator movement should be triggered.   
    DOOR_OPENING = 'DOOR_OPENING',
    DOOR_CLOSING = 'DOOR_CLOSING',
    DOOR_OPEN = 'DOOR_OPEN'// Means the elevator is stationary and the door is open

}

export enum DesignatedDirectionEnum {
    DESIGNATED_UP = 'DESIGNATED_UP',
    DESIGNATED_DOWN = 'DESIGNATED_DOWN',
    IDLE = 'IDLE'// Means the elevator has no "pending" floors to go to
}

export enum ElevatorEventsEnum {
    DESIGNATION_CHANGE = 'DESIGNATION_CHANGED',
    // MOVING_UP = 'MOVING_UP',
    // MOVING_DOWN = 'MOVING_DOWN',
    STATIONARY = 'STATIONARY',
    DOOR_OPENING = 'DOOR_OPENING',
    DOOR_CLOSING = 'DOOR_CLOSING',
    DOOR_CLOSING_CANCELED = 'DOOR_CLOSING_CANCELED',
    DOOR_OPENED = 'DOOR_OPENED',
    DOOR_CLOSED = 'DOOR_CLOSED',
    CURRENT_FLOOR = 'CURRENT_FLOOR',
    STATE_CHANGE = 'STATE_CHANGE',
    CHOSEN_FLOORS_FROM_ELEVATOR_ADDED = 'CHOSEN_FLOORS_FROM_ELEVATOR_ADDED',
    STOPPING_AT_FLOOR = 'STOPPING_AT_FLOOR',
    SELECTED_FLOORS_CHANGED = 'SELECTED_FLOORS_CHANGED',
    FLOORS_ORDERED_UP_CHANGED = 'FLOORS_ORDERED_UP_CHANGED',
    FLOORS_ORDERED_DOWN_CHANGED = 'FLOORS_ORDERED_DOWN_CHANGED',
    ERROR_FLOOR_OUT_OF_RANGE = 'ERROR_FLOOR_OUT_OF_RANGE',
    DOOR_STATE_PERCENTAGE = 'DOOR_STATE_PERCENTAGE'

}

export interface ElevatorConfig {
    id:number
    floorRange: Array<number>
    travelDelay?: number
    doorTimerDelay?:number
    completeDoorCycleTime?:number
    doorSteps?:number
}


export enum DirectionsEnum {
    UP = 'UP',
    DOWN = 'DOWN',
}

export enum RequestTypeEnum {
    UP = 'UP',
    DOWN = 'DOWN',
    SPECIFIC = 'SPECIFIC'
}


