import { EventEmitter } from '../EventEmitter';
import { Elevator } from '../Elevator/Elevator';
import { DesignatedDirectionEnum, ElevatorEventsEnum } from '..';
import { DispatcherEventsEnum } from './types';


export class Dispatcher extends EventEmitter {
    elevators: Elevator[] = []
    private floorsOrderedUpByElevatorId: { [index: number]: number[] } = {}
    private floorsOrderedDownByElevatorId: { [index: number]: number[] } = {}
    constructor(elevators: Elevator[]) {
        super();
        this.elevators = elevators
        for (let elevator of this.elevators) {
            this.floorsOrderedUpByElevatorId[elevator.id] = []
            this.floorsOrderedDownByElevatorId[elevator.id] = []
        }
        this.registerElevatorEvents()


    }

    private registerElevatorEvents() {
        for (let elevator of this.elevators) {
            elevator.on(ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, (floors: number[]) => {
                this.floorsOrderedDownByElevatorId[elevator.id] = floors
                this.emit(DispatcherEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, this.getFloorsOrderedInDirection('DOWN'))
            })
            elevator.on(ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, (floors: number[]) => {
                this.floorsOrderedUpByElevatorId[elevator.id] = floors
                this.emit(DispatcherEventsEnum.FLOORS_ORDERED_UP_CHANGED, this.getFloorsOrderedInDirection('UP'))
            })

        }
    }

    private getFloorsOrderedInDirection(direction: 'UP' | 'DOWN') {
        const floorsOrdered = []
        const relevantObject = direction === 'UP' ? this.floorsOrderedUpByElevatorId : this.floorsOrderedDownByElevatorId
        for (let elevatorId in relevantObject) {
            floorsOrdered.push(...relevantObject[elevatorId])
        }
        return floorsOrdered;
    }


    private getBestElevator(floor: number, desiredDirection: 'UP' | 'DOWN') {


        const numFloors = this.elevators[0].floorRange[1] - this.elevators[0].floorRange[0] + 1
        const maxDistance = numFloors * 2 - 1

        const elevatorGrades = []
        //PARAM 1:
        //floor is on the way of the elevator, and orderes to the same direction 1.0
        // elevator is idle and can serve any request  0.8
        //floor is on the way of elevator, but orderes opposite direction 0.6        
        //  floor is in not on the way of the elevator, and orderes to the opposite direction 0.2
        //  floor is not on the way of the elevator, and orderes to the same direction 0.2
        // 

        //PARAM 2:
        // normalized distance between the current floor and the ordering floor

        for (let elevator of this.elevators) {
            let directionCorrespondense: 'SAME' | 'OPPOSIE' | 'IDLE' = 'IDLE'
            if ((desiredDirection === 'UP' && elevator.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP) || (desiredDirection === 'DOWN' && elevator.designatedDirection ===  DesignatedDirectionEnum.DESIGNATED_DOWN)) {
                directionCorrespondense = 'SAME'
            } else if ((desiredDirection === 'UP'  && elevator.designatedDirection ===  DesignatedDirectionEnum.DESIGNATED_DOWN) || (desiredDirection === 'DOWN'  && elevator.designatedDirection ===  DesignatedDirectionEnum.DESIGNATED_UP)) {
                directionCorrespondense = 'OPPOSIE'
            }
            const distance = Math.abs(elevator.currentFloor - floor)
            const normalizedDistance = distance / maxDistance
            const invertedNormazlizedDistance = 1 - normalizedDistance
            let onTheWay: boolean = false;

            if (desiredDirection === 'UP') {
                if (floor >= elevator.currentFloor) {
                    onTheWay = true
                }
            }
            if (desiredDirection === 'DOWN') {
                if (floor <= elevator.currentFloor) {
                    onTheWay = true
                }
            }

            let grade;
            if (directionCorrespondense === 'SAME') {
                if (onTheWay) {
                    grade = 1.0
                } else {
                    grade = 0.2
                }
            } else if (directionCorrespondense === 'OPPOSIE') {
                if (onTheWay) {
                    grade = 0.6
                } else {
                    grade = 0.2
                }
            } else {//idle
                grade = 0.8
            }

         

            const finalGrade = invertedNormazlizedDistance * grade
            elevatorGrades.push(finalGrade)
        }

        const maxGrade = [...elevatorGrades].sort((a, b) => b - a)[0]
        const elevatorIndex = elevatorGrades.indexOf(maxGrade)
        return this.elevators[elevatorIndex]

    }



    /**
     * 
     * Returns the selected Elevator object, or undefined if request rejected
     */
    orderUp(floor: number): Elevator | undefined {

        for (let elevatorId in this.floorsOrderedUpByElevatorId) {
            if (this.floorsOrderedUpByElevatorId[elevatorId].includes(floor)) {
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


        const floorsOrderedUp = this.getFloorsOrderedInDirection('UP')
        this.emit(DispatcherEventsEnum.FLOORS_ORDERED_UP_CHANGED, floorsOrderedUp)
        return selectedElevator;
    }

    /**
     * 
     * Returns the selected Elevator object, or undefined if request rejected
     */
    orderDown(floor: number): Elevator | undefined {

        for (let elevatorId in this.floorsOrderedDownByElevatorId) {
            if (this.floorsOrderedDownByElevatorId[elevatorId].includes(floor)) {
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

        this.emit(DispatcherEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, floorsOrderedDown)
        return selectedElevator;
    }
}
