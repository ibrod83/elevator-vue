<script setup lang="ts">
import './Elevator.css'
import { DesignatedDirectionEnum, Elevator, ElevatorEventsEnum, StateEnum } from '@/elevator';
import type { ElevatorConfig } from '@/elevator/Elevator/types';
// import type { ElevatorConfig } from '@/elevator/types';

import { onMounted, onUnmounted, computed, markRaw } from 'vue'

import { ref } from 'vue'



const elevatorConfig: ElevatorConfig = { floorRange: [-1, 9], travelDelay: 500, completeDoorCycleTime: 1000, doorTimerDelay: 1500 }

let elevator = ref(markRaw(new Elevator(elevatorConfig)));

function getRandomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

const state = ref(StateEnum.DOOR_CLOSED)
const designation = ref(DesignatedDirectionEnum.IDLE)
const elevatorDoorPercentage = ref(100)

const floorRange = ref(elevatorConfig.floorRange)

const floorNumbers = computed(() => {
  const [start, end] = floorRange.value;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i).reverse()
});




const dummy = ref<number>(1)
const selectedFloors = ref<Array<number>>([])
const floorsOrderedDown = ref<Array<number>>([])
const floorsOrderedUp = ref<Array<number>>([])
const color = ref(getRandomHexColor());

const currentFloor = ref(0)
const stoppingAtFloor = ref<number | null>(0)


const changeColor = () => {
  color.value = getRandomHexColor()
}


const registerEvents = () => {
  elevator.value.on(ElevatorEventsEnum.DOOR_CLOSING_CANCELED, (data) => {
    console.log(`Event ${ElevatorEventsEnum.DOOR_CLOSING_CANCELED} emitted`, data);

  });

  elevator.value.on(ElevatorEventsEnum.STATE_CHANGE, (data) => {
    console.log(`Event ${ElevatorEventsEnum.STATE_CHANGE} emitted`, data);
    state.value = data
  });

  elevator.value.on(ElevatorEventsEnum.DESIGNATION_CHANGE, (data) => {
    console.log(`Event ${ElevatorEventsEnum.DESIGNATION_CHANGE} emitted`, data);
    designation.value = data
  });

  elevator.value.on(ElevatorEventsEnum.CURRENT_FLOOR, (data) => {
    console.log(`Event ${ElevatorEventsEnum.CURRENT_FLOOR} emitted`, data);
    currentFloor.value = data
    if (currentFloor.value !== stoppingAtFloor.value) {
      stoppingAtFloor.value = null
    }
  });

  elevator.value.on(ElevatorEventsEnum.STOPPING_AT_FLOOR, (data) => {
    console.log(`Event ${ElevatorEventsEnum.STOPPING_AT_FLOOR} emitted`, data);
    stoppingAtFloor.value = data

  });

  elevator.value.on(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, (data: Array<number>) => {
    selectedFloors.value = [...data]
    // console.log(`Event ${ElevatorEventsEnum.SELECTED_FLOORS_CHANGED} emitted`, data);


  })
  elevator.value.on(ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, (data: Array<number>) => {
    floorsOrderedDown.value = [...data]
    // console.log(`Event ${ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED} emitted`, data);


  })
  elevator.value.on(ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, (data: Array<number>) => {
    floorsOrderedUp.value = [...data]
    // console.log(`Event ${ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED} emitted`, data);


  })

  elevator.value.on(ElevatorEventsEnum.DOOR_STATE_PERCENTAGE, (data: number) => {
    elevatorDoorPercentage.value = data
    // console.log(`Event ${ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED} emitted`, data);


  })

}

// onUpdated(()=>{
//   console.log('updated')
// })

onMounted(() => {
  console.log(`the component is now mounted.`);
  elevator.value = new Elevator(markRaw(elevatorConfig));

  registerEvents()



});

onUnmounted(() => {//
  console.log(`Component is being unmounted, cleaning up event listeners.`);
  // elevator.value.cleanup();
  elevator.value.destroy()
})

const onOpenDoor = () => {
  // console.log('onOpenDoor')
  elevator.value.openDoor()
}

const onCloseDoor = () => {
  // console.log('onCloseDoor')
  elevator.value.closeDoor()
}

const onChooseFloor = (floor: number) => {

  elevator.value.chooseFloor(floor)
}

const onOrderUp = (floor: number) => {
  elevator.value.orderUp(floor)
}

const onOrderDown = (floor: number) => {
  elevator.value.orderDown(floor)
}

const getFloorStyle = (floor: number, percentage: number) => {
  if (floor === currentFloor.value && stoppingAtFloor.value === floor) {
    return {
      background: `linear-gradient(to right, red ${percentage}%, transparent ${percentage}%)`
    };
  } else if (floor === currentFloor.value) {
    return {
      background: 'green'
    }
  }
  return {}; // Default style for other floors
}

</script>

<template>
  <div class="container">
    <section id="indicators">
      <p class="indicator__elevatorState">{{ state }}</p>
      <p class="indicator__elevatorDesignation">{{ designation }}</p>
      <!-- <p class="indicator__elevatorDoorPercentage">Door state: {{ elevatorDoorPercentage }}</p> -->
    </section>
    <section id="panels">
      <div id="building" class="building">
        <div class="building__floors">
          <!-- Floors go here -->
          <div class="building__floor" v-for="floor in floorNumbers" :key="floor"
            :style="getFloorStyle(floor, elevatorDoorPercentage)">

            <button @click="onOrderUp(floor)" class="building__floorButton"
              :class="{ 'building__floorButton--selected': floorsOrderedUp.includes(floor) }">&#9650;
            </button>
            <span>
              {{ floor === 0 ? 'L' : floor }}
            </span>
            <button @click="onOrderDown(floor)" class="building__floorButton"
              :class="{ 'building__floorButton--selected': floorsOrderedDown.includes(floor) }">&#9660;
            </button>
          </div>
        </div>
        <div class="building__base"></div>
      </div>

      <div id="elevator">
        <div class="elevator__floorButtons">
          <button @click="onChooseFloor(floor)" v-for="floor in floorNumbers" :key="floor" class="elevator__floorButton"
            :class="{
              'elevator__floorButton--selected': selectedFloors.includes(floor)
            }">{{ floor === 0 ? 'L' : floor }}
          </button>
          <button @click="onCloseDoor()" class="elevator__action elevator__action--closeDoor">
            &#9654;|&#9664;
          </button>
          <button @click="onOpenDoor()" class="elevator__action elevator__action--openDoor">
            &#9664;&#9654;
          </button>
        </div>
      </div>
    </section>

  </div>
</template>


