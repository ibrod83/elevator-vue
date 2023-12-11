import { ElevatorEventsEnum, PrincipalStateEnum } from "..";
import { delay } from "../utils";
import { State } from "./State";
export class DesignatedDownState extends State {
    async run() {
        await this.processQueue('DOWN');
    }


    // closeDoor() {
    //     // Logic for closing the door in the down state
    // }

    // openDoor() {
    //     // Logic for opening the door in the down state
    // }
}
