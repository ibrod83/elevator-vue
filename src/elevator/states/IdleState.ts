import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { State } from "./State";
export class IdleState extends State {
    run() {

    }
    chooseFloor(floor: number) {
        if (floor < this.elevator.currentFloor) {
            this.handleChooseFloor('DOWN', floor)
            this.elevator.switchPrincipalState(PrincipalStateEnum.DESIGNATED_DOWN)

        } else if (floor > this.elevator.currentFloor) {
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

    // handleExternalOrder(floor: number, direction: 'UP'|'DOWN') {
    //     super.handleExternalOrder(floor,direction);
    //     this.elevator.switchPrincipalState(direction === 'DOWN' ? PrincipalStateEnum.DESIGNATED_DOWN : PrincipalStateEnum.DESIGNATED_UP)
    // }

    handleExternalOrder(floor: number, direction: 'UP' | 'DOWN') {
        if(floor === this.elevator.currentFloor){
            return;
        }
        super.handleExternalOrder(floor,direction)
        if(floor>this.elevator.currentFloor){
          this.elevator.switchPrincipalState( PrincipalStateEnum.DESIGNATED_UP)  
        }else{
            this.elevator.switchPrincipalState( PrincipalStateEnum.DESIGNATED_DOWN)  
        }
        
    }

    // closeDoor() {
    //     // Logic for closing the door in the idle state
    // }

    // openDoor() {
    //     // Logic for opening the door in the idle state
    // }
}
