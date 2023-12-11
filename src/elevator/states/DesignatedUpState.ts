import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { delay } from "../utils";
import { State } from "./State";
export class DesignatedUpState extends State {
    async run() {
        await this.processQueue('UP');
    }
    
    

    
    
    // closeDoor() {
    //     // Logic for closing the door in the up state
    // }

    // openDoor() {
    //     // Logic for opening the door in the up state
    // }
}
