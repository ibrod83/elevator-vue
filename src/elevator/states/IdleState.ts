import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { State } from "./State";

export class IdleState extends State {

    run() {

    }



    chooseFloor(floor: number) {
        if (floor < this.elevator.currentFloor) {

            // this.elevator.handleAddToQueue('DOWN',floor)
            this.handleChooseFloor('DOWN', floor)
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN)

        } else if (floor > this.elevator.currentFloor) {
            // this.elevator.handleAddToQueue('UP',floor)
            this.handleChooseFloor('UP', floor)
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_UP)

        } else {
            return
        }
    }

    orderDown(floor: number) {
        this.handleExternalOrder(floor, 'DOWN');
    }

    orderUp(floor: number) {
        this.handleExternalOrder(floor, 'UP');
    }

    private handleExternalOrder(floor: number, direction: 'UP'|'DOWN') {
        if(floor === this.elevator.currentFloor){
            return;
        }
        const arrayToUpdate = direction === 'DOWN' ? this.elevator.floorsOrderedDown : this.elevator.floorsOrderedUp 

        arrayToUpdate.push(floor)
        if(floor > this.elevator.currentFloor){
            this.handleAddToQueue('UP',floor)
        }else{
            this.handleAddToQueue('DOWN',floor)
        }
        this.elevator.emitEvent(direction === 'DOWN' ? ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED : ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED,arrayToUpdate)
        this.elevator.switchPrincipalState(direction === 'DOWN' ? PrincipalStateEnum.DESIGNATED_DOWN : PrincipalStateEnum.DESIGNATED_UP)
    }



    // closeDoor() {
    //     // Logic for closing the door in the idle state
    // }

    // openDoor() {
    //     // Logic for opening the door in the idle state
    // }
}
