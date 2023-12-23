import { EventEmitter } from "../EventEmitter";
import { DoorEventsEnum, type DoorConfig } from "./types";

export class Door extends EventEmitter {
    doorPercentage: number = 100;
    completeDoorCycleTime: number = 1000;
    private doorTimer: ReturnType<typeof setInterval> | null = null;
    private doorSteps:number

    constructor({completeDoorCycleTime= 1000,doorSteps= 100}:DoorConfig) {
        super();
        this.doorSteps = doorSteps
        this.completeDoorCycleTime = completeDoorCycleTime;
    }

    private clearDoorTimer() {
        if (this.doorTimer !== null) {
            clearInterval(this.doorTimer);
            this.doorTimer = null;
        }
    }

    open() {
        this.clearDoorTimer();


        const interval = Math.ceil(this.completeDoorCycleTime / this.doorSteps);
        const before = Date.now()
        this.doorTimer = setInterval(() => {

            if (this.doorPercentage > 0) {
                const newPercentage = this.doorPercentage-(100/this.doorSteps)
                this.doorPercentage = newPercentage<0 ? 0 : newPercentage;//
                this.emit(DoorEventsEnum.DOOR_STATE_PERCENTAGE, this.doorPercentage);
            } else {
                const after = Date.now()
                const diff = after - before;
                this.clearDoorTimer();
                this.emit(DoorEventsEnum.DOOR_OPENED);
            }
        }, interval);
    }

    close() {
        this.clearDoorTimer();

 

        const interval = Math.ceil(this.completeDoorCycleTime / this.doorSteps);
        this.doorTimer = setInterval(() => {
            if (this.doorPercentage < 100) {
                const newPercentage = this.doorPercentage+(100/this.doorSteps)
                this.doorPercentage = newPercentage>100 ? 100 : newPercentage;//
                this.emit(DoorEventsEnum.DOOR_STATE_PERCENTAGE, this.doorPercentage);
            } else {
                this.clearDoorTimer();
                this.emit(DoorEventsEnum.DOOR_CLOSED);
            }
        }, interval);
    }
}
