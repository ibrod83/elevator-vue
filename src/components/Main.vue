<script setup lang="ts">
import { Dispatcher } from '@/logic/Dispatcher/Dispatcher';
import './Elevator.scss'
import ElevatorPanel from './ElevatorPanel.vue';
import { DesignatedDirectionEnum, Elevator, ElevatorEventsEnum, StateEnum } from '@/logic';
import type { ElevatorConfig } from '@/logic/Elevator/types';

import { onMounted, onUnmounted, computed, markRaw, reactive, type Ref, type Raw } from 'vue'

import { ref } from 'vue'

const elevatorConfig: Omit<ElevatorConfig, 'id'> = { floorRange: [-1, 8], travelDelay: 500, completeDoorCycleTime: 1000, doorOpenDuration: 1500, delayBeforeDoorOpens: 300, travelSteps: 5 }

const elevator1 = new Elevator({ ...elevatorConfig, id: 1 });
const elevator2 = new Elevator({ ...elevatorConfig, id: 2 });
const dispatcher = new Dispatcher([elevator1, elevator2])
// const dispatcher = new Dispatcher([elevator1])

const floorRange = ref(elevatorConfig.floorRange)

const floorNumbers = computed(() => {
  const [start, end] = floorRange.value;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i).reverse()
});

interface ElevatorStates {
  1: ElevatorState,
  2: ElevatorState
  [index: number]: ElevatorState
}

interface ElevatorState {
  selectedFloors: Array<number>
  currentFloor: number,
  stoppingAtFloor: number | null,
  designatedDirection: DesignatedDirectionEnum,
  state: StateEnum
  elevatorDoorPercentage: number
}

const elevatorStates = reactive<ElevatorStates>({

  1: {
    selectedFloors: [],
    currentFloor: 0,
    stoppingAtFloor: 0,
    designatedDirection: DesignatedDirectionEnum.IDLE,
    state: StateEnum.DOOR_CLOSED,
    elevatorDoorPercentage: 100
  },
  2: {
    selectedFloors: [],
    currentFloor: 0,
    stoppingAtFloor: 0,
    designatedDirection: DesignatedDirectionEnum.IDLE,
    state: StateEnum.DOOR_CLOSED,
    elevatorDoorPercentage: 100
  }
})





const floorsOrderedDown = ref<Array<number>>([])
const floorsOrderedUp = ref<Array<number>>([])



const registerElevatorEvents = (elevator: Elevator, id: number) => {
  const state = elevatorStates;
  elevator.on(ElevatorEventsEnum.DOOR_CLOSING_CANCELED, (data) => {
    console.log(`Event ${ElevatorEventsEnum.DOOR_CLOSING_CANCELED} emitted`, data);

  });

  elevator.on(ElevatorEventsEnum.STATE_CHANGE, (data) => {
    console.log(`Event ${ElevatorEventsEnum.STATE_CHANGE} emitted`, data);
    state[id].state = data
  });

  elevator.on(ElevatorEventsEnum.DESIGNATION_CHANGE, (data) => {
    console.log(`Event ${ElevatorEventsEnum.DESIGNATION_CHANGE} emitted`, data);
    state[id] = { ...state[id], designatedDirection: data }
  });

  elevator.on(ElevatorEventsEnum.CURRENT_FLOOR, (data) => {
    console.log(`Event ${ElevatorEventsEnum.CURRENT_FLOOR} emitted`, data);
    state[id].currentFloor = data
    if (state[id].currentFloor !== state[id].stoppingAtFloor) {
      state[id].stoppingAtFloor = null
    }
  });

  elevator.on(ElevatorEventsEnum.STOPPING_AT_FLOOR, (data) => {
    console.log(`Event ${ElevatorEventsEnum.STOPPING_AT_FLOOR} emitted`, data);
    state[id].stoppingAtFloor = data

  });

  elevator.on(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, (data: Array<number>) => {
    state[id].selectedFloors = [...data]
    // console.log(`Event ${ElevatorEventsEnum.SELECTED_FLOORS_CHANGED} emitted`, data);


  })

  elevator.on(ElevatorEventsEnum.DOOR_STATE_PERCENTAGE, (data: number) => {
    state[id].elevatorDoorPercentage = data
    // console.log(`Event ${ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED} emitted`, data);


  })

}

const registerDispatcherEvents = () => {
  dispatcher.on(ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, (data: Array<number>) => {
    floorsOrderedDown.value = [...data]
    // console.log(`Event ${ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED} emitted`, data);


  })
  dispatcher.on(ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, (data: Array<number>) => {
    floorsOrderedUp.value = [...data]
    // console.log(`Event ${ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED} emitted`, data);

  })
}

registerElevatorEvents(elevator1, 1)
registerElevatorEvents(elevator2, 2)
registerDispatcherEvents()


onUnmounted(() => {//
  console.log(`Component is being unmounted, cleaning up event listeners.`);
  // elevator.cleanup();
  elevator1.destroy()
  elevator2.destroy()
})

const onOpenDoor = (elevator: Elevator) => {
  // console.log('onOpenDoor')
  elevator.openDoor()
}

const onCloseDoor = (elevator: Elevator) => {
  // console.log('onCloseDoor')
  elevator.closeDoor()//
}

const onChooseFloor = (floor: number, elevator: Elevator) => {

  elevator.chooseFloor(floor)
}

const onOrderUp = (floor: number) => {
  // elevator.orderUp(floor)
  dispatcher.orderUp(floor)
}

const onOrderDown = (floor: number) => {
  // elevator.orderDown(floor)
  dispatcher.orderDown(floor)
}

const getShaftPosition = (elevatorId: number) => {
  const numFloors = floorRange.value[1] - floorRange.value[0] + 1
  const elevator = elevatorId === 1 ? elevatorStates[1] : elevatorStates[2]
  // const relativeLocation = elevator.currentFloor/numFloors
  const deviationFromBottom = elevator.currentFloor - floorRange.value[0]
  // return `${relativeLocation <= 0 ? relativeLocation : relativeLocation*100-10}%`
  return `${(deviationFromBottom / numFloors) * 100}%`

}

const getElevatorStyle = (elevatorId: number) => {
  return {
    bottom: getShaftPosition(elevatorId),
  }
}

const getElevatorDoorStyle = (elevatorId: number) => {
  const state = elevatorStates[elevatorId]
  const absoluteDoorPercentage = state.elevatorDoorPercentage
  const relativePercentage = absoluteDoorPercentage / 2
  const styleObj = {
    width: `${relativePercentage}%`
  }

  return styleObj
}



</script>
<template>
  <div >

    <main class="main container-fluid">
      <div class="row">
        <div class="col-6">
          <section class="building">
            <div class="building__roof">
              <div class="building__roof-triangle"></div>
              <div class="building__roof-rectangle"></div>
              <div class="building__roof-circle"></div>
            </div>
            <!-- <div v-for="floor in floorNumbers" :key="floor" class="building__floor"> -->
            <div class="building__body">
              <div class="building__shaft">
                <div class="elevator" :style="getElevatorStyle(1)">
                  <div class="elevator__door elevator__door--left" :style="getElevatorDoorStyle(1)">

                  </div>
                  <div class="elevator__door elevator__door--right" :style="getElevatorDoorStyle(1)">

                  </div>
                  <div v-if="elevator1.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP"
                    class="elevator__indicator">&uarr;</div>
                  <div v-if="elevator1.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN"
                    class="elevator__indicator">&darr;</div>
                </div>
              </div>

              <div class="building__lobby">
                <div v-for="floor in floorNumbers" :key="floor" class="building__lobby-floor">
                  <p class="building__writing">{{ floor === 0 ? 'L' : floor }}</p>
                  <button v-if="floor !== floorRange[1]" @click="onOrderUp(floor)" class="building__floorButton"
                    :class="{ 'building__floorButton--selected': floorsOrderedUp.includes(floor) }">&#9650;
                  </button>
                  <button v-if="floor !== floorRange[0]" @click="onOrderDown(floor)" class="building__floorButton"
                    :class="{ 'building__floorButton--selected': floorsOrderedDown.includes(floor) }">&#9660;
                  </button>
                </div>
              </div>
              <div class="building__shaft">
                <div class="elevator" :style="getElevatorStyle(2)">
                  <div class="elevator__door elevator__door--left" :style="getElevatorDoorStyle(2)">

                  </div>
                  <div class="elevator__door elevator__door--right" :style="getElevatorDoorStyle(2)">

                  </div>
                  <div v-if="elevator2.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP"
                    class="elevator__indicator">&uarr;</div>
                  <div v-if="elevator2.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN"
                    class="elevator__indicator">&darr;</div>
                </div>
              </div>
            </div>


            <!-- </div> -->

          </section>
        </div>
        <div class="col-6">
          <div class="row">
            <div class="col">
              <header class="header">
                <h1>Elevator simulator</h1>
                <h2>Simple simulator of a two-elevator system in a building</h2>
              </header>

            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="panels">

                <div class="elevator-panel">
                  <ElevatorPanel :designatedDirection="elevatorStates[1].designatedDirection"
                    :current-floor="Math.round(elevatorStates[1].currentFloor)" :floor-numbers="floorNumbers"
                    @on-choose-floor="(floor: number) => onChooseFloor(floor, elevator1)"
                    @on-open-door="onOpenDoor(elevator1)" @on-close-door="onCloseDoor(elevator1)"
                    :selected-floors="elevatorStates[1].selectedFloors" />
                </div>
                <div class="elevator-panel">
                  <ElevatorPanel :designatedDirection="elevatorStates[2].designatedDirection"
                    :current-floor="Math.round(elevatorStates[2].currentFloor)" :floor-numbers="floorNumbers"
                    @on-choose-floor="(floor: number) => onChooseFloor(floor, elevator2)"
                    @on-open-door="onOpenDoor(elevator2)" @on-close-door="onCloseDoor(elevator2)"
                    :selected-floors="elevatorStates[2].selectedFloors" />
                </div>

              </div>
            </div>
            <div class="col">
              <div class="description">
                <p>The program simulates the behavior of a typical pair of elevators. Each elevator has specific buttons
                  for
                  every floor in the building, whereas each floor hallway(except for the edge floors) has "up" and
                  "down"
                  buttons, to dispatch an elevator</p>
                <br>
                <p> The code is here: www.link-link-link.com</p>
                <br>
                <p> Code: ibrod83</p>
                <br>
                <p> Design: rona manor</p>

              </div>
              <div class="controls">
                <button>1</button>
                <button>2</button>
                <button>3</button>
              </div>
            </div>
          </div>

        </div>
      </div>



    </main>

  </div>
</template>
