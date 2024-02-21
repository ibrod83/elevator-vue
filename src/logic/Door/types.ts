export enum DoorEventsEnum{
    DOOR_CLOSED = 'DOOR_CLOSED',
    DOOR_OPENED= 'DOOR_OPENED',
    DOOR_STATE_PERCENTAGE = 'DOOR_STATE_PERCENTAGE'
}

export interface DoorConfig{
    completeDoorCycleTime?: number,
    doorSteps?:number
}