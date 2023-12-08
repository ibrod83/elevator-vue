export enum TechnicalStateEnum {
    MOVING_UP = 'MOVING_UP',
    MOVING_DOWN = 'MOVING_DOWN',
    DOOR_CLOSED = 'DOOR_CLOSED',
    DOOR_OPENING = 'DOOR_OPENING',
    DOOR_CLOSING = 'DOOR_CLOSING',
    DOOR_OPEN = 'DOOR_OPEN'

}

export enum PrincipalStateEnum{
    DESIGNATED_UP='DESIGNATED_UP',
    DESIGNATED_DOWN='DESIGNATED_DOWN',
    IDLE='IDLE'
}

export enum ElevatorEventsEnum {
    MOVING_UP = 'MOVING_UP',
    MOVING_DOWN = 'MOVING_DOWN',
    STATIONARY = 'STATIONARY',
    DOOR_OPENING = 'DOOR_OPENING',
    DOOR_CLOSING = 'DOOR_CLOSING',
    DOOR_CLOSING_CANCELED = 'DOOR_CLOSING_CANCELED',
    DOOR_OPENED = 'DOOR_OPENED',
    DOOR_CLOSED='DOOR_CLOSED',
    CURRENT_FLOOR = 'CURRENT_FLOOR',
    TECHNICAL_STATE_CHANGE = 'TECHNICAL_STATE_CHANGE',
    PRINCIPAL_STATE_CHANGE = 'PRINCIPAL_STATE_CHANGE',
    CHOSEN_FLOORS_FROM_ELEVATOR_ADDED='CHOSEN_FLOORS_FROM_ELEVATOR_ADDED',
    UP_QUEUE_FINISHED='UP_QUEUE_FINISHED',
    DOWN_QUEUE_FINISHED='DOWN_QUEUE_FINISHED',
    STOPPING_AT_FLOOR = 'STOPPING_AT_FLOOR',
    SELECTED_FLOORS_CHANGED = 'SELECTED_FLOORS_CHANGED',
    FLOORS_ORDERED_UP_CHANGED = 'FLOORS_ORDERED_UP_CHANGED',
    FLOORS_ORDERED_DOWN_CHANGED = 'FLOORS_ORDERED_DOWN_CHANGED',
    ERROR_FLOOR_OUT_OF_RANGE='ERROR_FLOOR_OUT_OF_RANGE',
    // TRACKING_STATE_CHANGED= 'TRACKING_STATE_CHANGED'

}

export interface ElevatorConfig{
    floorRange:Array<number>
    travelDelay:number
    stopDelay:number
}

export interface ElevatorTrackingState{
    selectedFloors: number[] 
    floorsOrderedUp: number[]
    floorsOrderedDown: number[] 
    currentFloor: number 
}

// // Interface for the principal state of the elevator
// export interface PrincipalState {
//     chooseFloor(floor: number): void;
//     openDoor(): void;
//     closeDoor(): void;
//     orderUp(): void;
//     orderDown(): void;
// }