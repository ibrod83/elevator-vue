export enum StateEnum {
    MOVING = 'MOVING',
    DOOR_CLOSED='DOOR_CLOSED',
    READY_FOR_MOVEMENT = 'READY_FOR_MOVEMENT',// Means the elevator is stationary and the door is closed.
    //  If there is any designated floor up or down, the elevator movement should be triggered. 
    DOOR_OPENING = 'DOOR_OPENING',
    DOOR_CLOSING = 'DOOR_CLOSING',
    DOOR_OPEN = 'DOOR_OPEN'// Means the elevator is stationary and the door is open

}

export enum DesignatedDirectionEnum{
    DESIGNATED_UP='DESIGNATED_UP',
    DESIGNATED_DOWN='DESIGNATED_DOWN',
    NONE='NONE'// Means the elevator has no "pending" floors to go to
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
    STATE_CHANGE = 'STATE_CHANGE',
    PRINCIPAL_STATE_CHANGE = 'PRINCIPAL_STATE_CHANGE',
    CHOSEN_FLOORS_FROM_ELEVATOR_ADDED='CHOSEN_FLOORS_FROM_ELEVATOR_ADDED',
    UP_QUEUE_FINISHED='UP_QUEUE_FINISHED',
    DOWN_QUEUE_FINISHED='DOWN_QUEUE_FINISHED',
    STOPPING_AT_FLOOR = 'STOPPING_AT_FLOOR',
    SELECTED_FLOORS_CHANGED = 'SELECTED_FLOORS_CHANGED',
    FLOORS_ORDERED_UP_CHANGED = 'FLOORS_ORDERED_UP_CHANGED',
    FLOORS_ORDERED_DOWN_CHANGED = 'FLOORS_ORDERED_DOWN_CHANGED',
    ERROR_FLOOR_OUT_OF_RANGE='ERROR_FLOOR_OUT_OF_RANGE',

}

export interface ElevatorConfig{
    floorRange:Array<number>
    travelDelay:number
    closeDoorDelay:number
   openDoorDelay:number
}


export enum DirectionsEnum {
    UP='UP',
    DOWN = 'DOWN',
}

export enum RequestTypeEnum{
    UP='UP',
    DOWN = 'DOWN',
    SPECIFIC='SPECIFIC'
}


