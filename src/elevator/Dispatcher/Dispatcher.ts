import { EventEmitter } from '../EventEmitter';
import { Elevator } from '../Elevator/Elevator';
import { DesignatedDirectionEnum, ElevatorEventsEnum } from '..';
import { DispatcherEventsEnum } from './types';


export class Dispatcher extends EventEmitter {
    elevators: Elevator[] = []
    private floorsOrderedUpByElevatorId:{[index:number]:number[]} = {}
    private floorsOrderedDownByElevatorId:{[index:number]:number[]} = {}
    constructor(elevators: Elevator[]) {
        super();
        this.elevators = elevators
        for(let elevator of this.elevators){
            this.floorsOrderedUpByElevatorId[elevator.id] = []
            this.floorsOrderedDownByElevatorId[elevator.id] = []
        }
        this.registerElevatorEvents()
        

    }

    private registerElevatorEvents() {
        for (let elevator of this.elevators) {
            elevator.on(ElevatorEventsEnum.STOPPING_AT_FLOOR, (floor: number) => {
                this.floorsOrderedDownByElevatorId[elevator.id] = this.floorsOrderedDownByElevatorId[elevator.id].filter(f=>f!==floor)
                this.floorsOrderedUpByElevatorId[elevator.id] = this.floorsOrderedUpByElevatorId[elevator.id].filter(f=>f!==floor)
                this.emit(DispatcherEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, this.getFloorsOrderedInDirection('DOWN'))
                this.emit(DispatcherEventsEnum.FLOORS_ORDERED_UP_CHANGED, this.getFloorsOrderedInDirection('UP'))
            })

        }
    }

    private getFloorsOrderedInDirection(direction:'UP'|'DOWN'){
        const floorsOrdered = []
        const relevantObject = direction === 'UP' ? this.floorsOrderedUpByElevatorId : this.floorsOrderedDownByElevatorId
        for(let elevatorId in  relevantObject){
            floorsOrdered.push(...relevantObject[elevatorId])
        }
        return floorsOrdered;
    }


    private getBestElevator(floor: number, desiredDirection: 'UP' | 'DOWN') {


        const numFloors = this.elevators[0].floorRange[1] - this.elevators[0].floorRange[0] + 1
        const maxDistance = numFloors * 2 - 1

        const correspondingDesignation = desiredDirection === 'UP' ? DesignatedDirectionEnum.DESIGNATED_UP : DesignatedDirectionEnum.DESIGNATED_DOWN
        const oppositeDesignation = desiredDirection === 'UP' ? DesignatedDirectionEnum.DESIGNATED_DOWN : DesignatedDirectionEnum.DESIGNATED_UP

        const elevatorGrades = []

        for (let elevator of this.elevators) {
                       
            const distance = elevator.getDistanceToDestinationFloor(floor)
            const normalizedDistance = distance / maxDistance
            const invertedNormazlizedDistance = 1 - normalizedDistance
            let designationGrade;
            if (correspondingDesignation === elevator.designatedDirection) {
                designationGrade = 1.0
            } else if (oppositeDesignation === elevator.designatedDirection){
                designationGrade = 0.5
            }else{
                designationGrade = 0.8
            }

            const finalGrade = invertedNormazlizedDistance*designationGrade
            elevatorGrades.push(finalGrade) 
         }

        const  maxGrade = [...elevatorGrades].sort((a,b)=>b-a)[0]
        const elevatorIndex = elevatorGrades.indexOf(maxGrade)
        return this.elevators[elevatorIndex]

    }
    


    orderUp(floor: number) {

        // if(this.floorsOrderedUp.includes(floor)){
        //     return;
        // }
        for(let elevatorId in  this.floorsOrderedUpByElevatorId){
             if(this.floorsOrderedUpByElevatorId[elevatorId].includes(floor)){
                return;
             }
        }

        const selectedElevator = this.getBestElevator(floor, 'UP')
        const wasOrderAccepted = selectedElevator.orderUp(floor)
        if (!wasOrderAccepted) {
            console.log('not accepted!')
            return;
        }

        this.floorsOrderedUpByElevatorId[selectedElevator.id].push(floor)

        // this.floorsOrderedUp.push(floor)
        // this.once(ElevatorEventsEnum.STOPPING_AT_FLOOR,())
        const floorsOrderedUp = this.getFloorsOrderedInDirection('UP')
        this.emit(DispatcherEventsEnum.FLOORS_ORDERED_UP_CHANGED, floorsOrderedUp)
    }

    orderDown(floor: number) {

        for(let elevatorId in  this.floorsOrderedDownByElevatorId){
            if(this.floorsOrderedDownByElevatorId[elevatorId].includes(floor)){
               return;
            }
       }

        const selectedElevator = this.getBestElevator(floor, 'DOWN')
        const wasOrderAccepted = selectedElevator.orderDown(floor)
        if (!wasOrderAccepted) {
            console.log('not accepted!')
            return;
        }
        this.floorsOrderedDownByElevatorId[selectedElevator.id].push(floor)
        const floorsOrderedDown = this.getFloorsOrderedInDirection('DOWN')
        // this.floorsOrderedDown.push(floor)
        this.emit(DispatcherEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, floorsOrderedDown)
    }
}
