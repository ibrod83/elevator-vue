<script setup lang="ts">
import { Dispatcher } from '@/elevator/Dispatcher/Dispatcher';
import './Elevator.scss'
import { DesignatedDirectionEnum, Elevator, ElevatorEventsEnum, StateEnum } from '@/elevator';
import type { ElevatorConfig } from '@/elevator/Elevator/types';

import { onMounted, onUnmounted, computed, markRaw, reactive, type Ref, type Raw } from 'vue'

import { ref } from 'vue'

const elevatorConfig: Omit<ElevatorConfig,'id'> = { floorRange: [-1, 9], travelDelay: 1000, completeDoorCycleTime: 1000, doorTimerDelay: 1500 }

const elevator1 = new Elevator({...elevatorConfig,id:1});
const elevator2 = new Elevator({...elevatorConfig,id:2});
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
  [index:number]:ElevatorState
}

interface ElevatorState {
  selectedFloors: Array<number>
  currentFloor: number,
  stoppingAtFloor: number | null,
  designation: DesignatedDirectionEnum,
  state: StateEnum
  elevatorDoorPercentage: number
}

const elevatorStates = reactive<ElevatorStates>({
  
  1: {
    selectedFloors: [],
    currentFloor: 0,
    stoppingAtFloor: 0,
    designation: DesignatedDirectionEnum.IDLE,
    state: StateEnum.DOOR_CLOSED,
    elevatorDoorPercentage: 100
  },
  2:{
    selectedFloors: [],
    currentFloor: 0,
    stoppingAtFloor: 0,
    designation: DesignatedDirectionEnum.IDLE,
    state: StateEnum.DOOR_CLOSED,
    elevatorDoorPercentage: 100
  }
})





const floorsOrderedDown = ref<Array<number>>([])
const floorsOrderedUp = ref<Array<number>>([])



const registerElevatorEvents = (elevator: Elevator, id:number) => {
  const state =  elevatorStates;
  elevator.on(ElevatorEventsEnum.DOOR_CLOSING_CANCELED, (data) => {
    console.log(`Event ${ElevatorEventsEnum.DOOR_CLOSING_CANCELED} emitted`, data);

  });

  elevator.on(ElevatorEventsEnum.STATE_CHANGE, (data) => {
    console.log(`Event ${ElevatorEventsEnum.STATE_CHANGE} emitted`, data);
    state[id].state = data
  });

  elevator.on(ElevatorEventsEnum.DESIGNATION_CHANGE, (data) => {
    console.log(`Event ${ElevatorEventsEnum.DESIGNATION_CHANGE} emitted`, data);
    state[id] = {...state[id],designation:data}
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

const registerDispatcherEvents=()=>{
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

const getShaftStyle = (floor: number, percentage: number, elevatorId: number) => {
  const elevator = elevatorId === 1 ? elevatorStates[1] : elevatorStates[2]
  if (floor === elevator.currentFloor && elevator.stoppingAtFloor === floor) {
    return {
      background: `linear-gradient(to right, red ${percentage}%, transparent ${percentage}%)`
    };
  } else if (floor === elevator.currentFloor) {
    return {
      background: 'green'
    }
  }
  return {}; // Default style for other floors
}

</script>
<template>
  <div class="container">
    <!-- <section id="indicators">
      <p class="indicator__elevatorState">{{ state }}</p>
      <p class="indicator__elevatorDesignation">{{ designation }}</p>
    </section> -->
    <section id="panels">
      
      <div id="elevator1">
        <div class="elevator__floorButtons">
          <button @click="onChooseFloor(floor,elevator1)" v-for="floor in floorNumbers" :key="floor" class="elevator__floorButton"
            :class="{
              'elevator__floorButton--selected': elevatorStates[1].selectedFloors.includes(floor)
            }">{{ floor === 0 ? 'L' : floor }}
          </button>
          <button @click="onCloseDoor(elevator1)" class="elevator__action elevator__action--closeDoor">
            &#9654;|&#9664;
          </button>
          <button @click="onOpenDoor(elevator1)" class="elevator__action elevator__action--openDoor">
            &#9664;&#9654;
          </button>
        </div>
      </div>
      <div class="building">
        <div v-for="floor in floorNumbers" :key="floor" class="building__floor"
          >
          <div class="building__shaft" :style="getShaftStyle(floor, elevatorStates[1].elevatorDoorPercentage,1)">
            <div v-if="elevator1.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP && elevator1.currentFloor === floor" class="building__indicator">&uarr;</div>
            <div v-if="elevator1.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN && elevator1.currentFloor === floor" class="building__indicator">&darr;</div>
            <!-- <div class="building__indicator"></div> -->
          </div>
          <div class="building__lobby">
            <p class="building__writing">{{ floor === 0 ? 'L' : floor }}</p>
            <button v-if="floor !== floorRange[1]" @click="onOrderUp(floor)" class="building__floorButton"
              :class="{ 'building__floorButton--selected': floorsOrderedUp.includes(floor) }">&#9650;
            </button>
            <button v-if="floor !== floorRange[0]" @click="onOrderDown(floor)" class="building__floorButton"
              :class="{ 'building__floorButton--selected': floorsOrderedDown.includes(floor) }">&#9660;
            </button>
          </div>
           <div class="building__shaft" :style="getShaftStyle(floor, elevatorStates[2].elevatorDoorPercentage,2)">
            <div v-if="elevator2.designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP && elevator2.currentFloor === floor" class="building__indicator">&uarr;</div>
            <div v-if="elevator2.designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN && elevator2.currentFloor === floor" class="building__indicator">&darr;</div>
          </div> 
        </div>

      </div>

       <div id="elevator2">
        <div class="elevator__floorButtons">
          <button @click="onChooseFloor(floor,elevator2)" v-for="floor in floorNumbers" :key="floor" class="elevator__floorButton"
            :class="{
              'elevator__floorButton--selected': elevatorStates[2].selectedFloors.includes(floor)
            }">{{ floor === 0 ? 'L' : floor }}
          </button>
          <button @click="onCloseDoor(elevator2)" class="elevator__action elevator__action--closeDoor">
            &#9654;|&#9664;
          </button>
          <button @click="onOpenDoor(elevator2)" class="elevator__action elevator__action--openDoor">
            &#9664;&#9654;
          </button>
        </div>
      </div> 
    </section>

  </div>
</template>

