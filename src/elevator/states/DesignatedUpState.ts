import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { delay } from "../utils";
import { State } from "./State";
export class DesignatedUpState extends State {
    async run() {
        while (this.elevator.upQueue.length && !this.elevator.isDestroyed) {
            const nextFloor = this.elevator.currentFloor + 1;
            await delay(this.elevator.travelDelay);
    
            // Update the current floor
            this.elevator.currentFloor = nextFloor;
            this.elevator.emitEvent(ElevatorEventsEnum.CURRENT_FLOOR, this.elevator.currentFloor);
            const isExternalDownOrder = this.elevator.floorsOrderedDown.includes(nextFloor)
            const isCurrentFloorLast = this.elevator.upQueue.length === 1
            
            // Check if the current floor matches the next floor in the up queue
            if (this.elevator.upQueue.peek() === nextFloor) {
                if(isExternalDownOrder && !isCurrentFloorLast){
                    this.elevator.upQueue.dequeue()
                    this.elevator.downQueue.queue(nextFloor)
                    continue;
                }
                // if(isExternalDownOrder && is)
                this.handleStoppedAtFloor('UP', nextFloor);
                await delay(this.elevator.stopDelay); // Simulate the time taken to stop at a floor
            }
        }
    
        // Switch to the next state after processing the up queue
        this.switchToNextState();
    }
    
    

    orderDown(floor: number) {
        this.handleExternalOrder(floor, 'DOWN')
    }

    orderUp(floor: number) {
        this.handleExternalOrder(floor, 'UP')
    }

    
    // closeDoor() {
    //     // Logic for closing the door in the up state
    // }

    // openDoor() {
    //     // Logic for opening the door in the up state
    // }
}
