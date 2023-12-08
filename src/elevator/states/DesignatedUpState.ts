import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { delay } from "../utils";
import { State } from "./State";

export class DesignatedUpState extends State {

    async run() {
        while (this.elevator.upQueue.length && !this.elevator.isDestroyed) {
            // await delay(2000)
            const nextFloor = this.elevator.currentFloor + 1 
            await delay(this.elevator.travelDelay); 
            const nextFloorToStop = this.elevator.upQueue.peek()
           
            
            this.elevator.currentFloor = nextFloor
            this.elevator.emitEvent(ElevatorEventsEnum.CURRENT_FLOOR, this.elevator.currentFloor)
            if (nextFloor === nextFloorToStop) {
                // this.elevator.handleRemoveFromQueue('UP',nextFloor)
                 this.handleStoppedAtFloor('UP',nextFloor)
                // this.elevator.emitEvent(ElevatorEventsEnum.STOPPING_AT_FLOOR, nextFloorToStop)           
               
                await delay(this.elevator.stopDelay); // Simulate the time taken to stop at a floor

                
            }

        }
        this.elevator.emitEvent(ElevatorEventsEnum.UP_QUEUE_FINISHED,undefined);
        if (this.elevator.downQueue.length) {

            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN);
            // this.processDownState()
        } else {
            this.elevator.switchPrincipalState(PrincipalStateEnum.IDLE)
        }


    }

    orderDown(floor:number){
        // // this.elevator.handleExternalOrder('DOWN',floor)
        // if (floor > this.currentFloor) {
        //     this.handleAddToQueue('UP', floor)
        // } else if (floor < this.currentFloor) {
        //     this.handleAddToQueue('DOWN', floor)
        // } else {
        //     return;
        // }

        // const orderersArray = direction === 'DOWN' ? this.floorsOrderedDown : this.floorsOrderedUp
        // if (orderersArray.includes(floor)) {
        //     return;
        // }

        // orderersArray.push(floor)

        // this.emit(direction === 'DOWN' ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, orderersArray)
    }

    orderUp(floor:number){
        // this.elevator.handleExternalOrder('UP',floor)

        
    }
    

    // closeDoor() {
    //     // Logic for closing the door in the up state
    // }

    // openDoor() {
    //     // Logic for opening the door in the up state
    // }
}
