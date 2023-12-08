import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { delay } from "../utils";
import { State } from "./State";

export class DesignatedDownState extends State {

    async run() {
        while (this.elevator.downQueue.length && !this.elevator.isDestroyed) {
            // await delay(2000) // This line is commented out as in processUpState
            const currentFloor = this.elevator.currentFloor - 1;      
            // this.elevator.processFloorIntegrity(nextFloor)     
            await delay(this.elevator.travelDelay);
            const nextFloor = this.elevator.downQueue.peek();
          

            this.elevator.currentFloor = currentFloor;
            this.elevator.emitEvent(ElevatorEventsEnum.CURRENT_FLOOR, this.elevator.currentFloor)

            if (currentFloor === nextFloor) {

                // this.elevator.handleRemoveFromQueue('DOWN',currentFloor)
                this.handleStoppedAtFloor('DOWN',currentFloor)
                // this.elevator.emitEvent(ElevatorEventsEnum.STOPPING_AT_FLOOR, nextFloonextFloorrnextFloorToStop)
                await delay(this.elevator.stopDelay); // Simulate the time taken to stop at a floor
                
            }
        }
        this.elevator.emitEvent(ElevatorEventsEnum.DOWN_QUEUE_FINISHED);
        if (this.elevator.upQueue.length) {

            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP);
        } else {
            this.elevator.switchPrincipalState(PrincipalStateEnum.IDLE);
        }

    }

    orderDown(floor:number){
        // this.elevator.handleExternalOrder('DOWN',floor)
    }

    orderUp(floor:number){
        // this.elevator.handleExternalOrder('UP',floor)
    }
    


    // closeDoor() {
    //     // Logic for closing the door in the down state
    // }

    // openDoor() {
    //     // Logic for opening the door in the down state
    // }
}
