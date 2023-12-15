import { Elevator } from "@/elevator";

export function createElevator(...args:any){
    return new Elevator(args)
}