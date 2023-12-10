import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { delay } from "../utils";
import { State } from "./State";
export class DesignatedDownState extends State {
    async run() {
        while (this.elevator.downQueue.length && !this.elevator.isDestroyed) {
            const nextFloor = this.elevator.currentFloor - 1;
            await delay(this.elevator.travelDelay);
    
            // Update the current floor
            this.elevator.currentFloor = nextFloor;
            this.elevator.emitEvent(ElevatorEventsEnum.CURRENT_FLOOR, this.elevator.currentFloor);
            const isExternalUpOrder = this.elevator.floorsOrderedUp.includes(nextFloor)
            const isCurrentFloorLast = this.elevator.downQueue.length === 1
            // Check if the current floor matches the next floor in the down queue
            if (this.elevator.downQueue.peek() === nextFloor) {
                if(isExternalUpOrder && !isCurrentFloorLast){
                    this.elevator.downQueue.dequeue()
                    this.elevator.upQueue.queue(nextFloor)
                    continue;
                }
                this.handleStoppedAtFloor('DOWN', nextFloor);
                await delay(this.elevator.stopDelay); // Simulate the time taken to stop at a floor
            }
        }
    
        // Switch to the next state after processing the down queue
        this.switchToNextState();
    }
    
    

    orderDown(floor: number) {
        this.handleExternalOrder(floor, 'DOWN')
    }

    orderUp(floor: number) {
        this.handleExternalOrder(floor, 'UP')
    }

    // closeDoor() {
    //     // Logic for closing the door in the down state
    // }

    // openDoor() {
    //     // Logic for opening the door in the down state
    // }
}
