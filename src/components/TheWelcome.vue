<script setup lang="ts">
import './Elevator.css'
import { Elevator, ElevatorEventsEnum, TechnicalStateEnum } from '@/elevator';

import { onMounted, onUnmounted, onUpdated, computed } from 'vue'

import { getRandomWholeNumber } from '../elevator/utils'

import { ref } from 'vue'

function getRandomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

const technicalState = ref(TechnicalStateEnum.DOOR_CLOSED)

const floorRange = ref([0, 9])

const floorNumbers = computed(() => {
  const [start, end] = floorRange.value;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i).reverse()
});



const elevator = ref(new Elevator({ floorRange: [0, 9], travelDelay: 300, stopDelay: 600 }));

const selectedFloors = ref<Array<number>>([])
const floorsOrderedDown = ref<Array<number>>([])
const floorsOrderedUp = ref<Array<number>>([])
const color = ref(getRandomHexColor());

const currentFloor = ref(0)
const stoppingAtFloor = ref<number | null>(0)


const changeColor = () => {
  color.value = getRandomHexColor()
}


const registerEvents = () => {//
  elevator.value.on(ElevatorEventsEnum.DOOR_CLOSING_CANCELED, (data) => {
    console.log(`Event ${ElevatorEventsEnum.DOOR_CLOSING_CANCELED} emitted`, data);

  });

  elevator.value.on(ElevatorEventsEnum.TECHNICAL_STATE_CHANGE, (data) => {
    console.log(`Event ${ElevatorEventsEnum.TECHNICAL_STATE_CHANGE} emitted`, data);
    technicalState.value = data
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

  elevator.value.on(ElevatorEventsEnum.UP_QUEUE_FINISHED, (data) => {
    console.log(`Event ${ElevatorEventsEnum.UP_QUEUE_FINISHED} emitted`, data);
  
  })
  elevator.value.on(ElevatorEventsEnum.DOWN_QUEUE_FINISHED, (data) => {
    console.log(`Event ${ElevatorEventsEnum.DOWN_QUEUE_FINISHED} emitted`, data);
  
  })

  elevator.value.on(ElevatorEventsEnum.SELECTED_FLOORS_CHANGED, (data: Array<number>) => {
    selectedFloors.value = data
    console.log(`Event ${ElevatorEventsEnum.SELECTED_FLOORS_CHANGED} emitted`, data);

  })
  elevator.value.on(ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED, (data: Array<number>) => {
    floorsOrderedDown.value = data
    console.log(`Event ${ElevatorEventsEnum.FLOORS_ORDERED_DOWN_CHANGED} emitted`, data);

    
  })
  elevator.value.on(ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED, (data: Array<number>) => {
    floorsOrderedUp.value = data
    console.log(`Event ${ElevatorEventsEnum.FLOORS_ORDERED_UP_CHANGED} emitted`, data);

    
  })
  
}

// onUpdated(()=>{
//   console.log('updated')
// })

onMounted(() => {
  console.log(`the component is now mounted.`);
  elevator.value = new Elevator({ floorRange: [0, 9], travelDelay: 800, stopDelay: 1200 });

  // elevator.value.value = new Elevator([1, 10]);
  registerEvents()



  // elevator.value.run()
  // elevator.value.chooseFloor(1)
  // elevator.value.chooseFloor(3)
  // elevator.value.chooseFloor(7)

  // setTimeout(() => {
  //   elevator.value.orderUp(5)
  // }, 1000)
  // elevator.value.chooseFloor(5)
  // elevator.value.chooseFloor(0)

  // elevator.value.processUpState()
  // elevator.value.processIdleState()


});

onUnmounted(() => {//
  console.log(`Component is being unmounted, cleaning up event listeners.`);
  // elevator.value.cleanup();
  elevator.value.destroy()
})

// const onOpenDoor = () => {
//   elevator.value.openDoor()
// }

// const onCloseDoor = () => {
//   elevator.value.closeDoor()
// }

const onChooseFloor = (floor: number) => {
  elevator.value.chooseFloor(floor)
}

const onOrderUp = (floor:number)=>{
  elevator.value.orderUp(floor)
}

const onOrderDown = (floor:number)=>{
  elevator.value.orderDown(floor)
}

</script>

<template>
  <main>
    <!-- <section id="controls">
      <button class="" @click="onOpenDoor">Open Door</button>
      <button @click="onCloseDoor">Close Door</button>
      <button onclick=""></button>
      <p>{{ technicalState }}</p>
      <p :style="{ color: color }">This is a paragraph with dynamic color.</p>
      <button @click="changeColor">Change Color</button>
    </section> -->
    <section id="building" class="building">
      <div class="building__floors">
        <!-- Floors go here -->
        <div class="building__floor" v-for="floor in floorNumbers" :key="floor" :class="{
          'building__floor--current': floor === currentFloor,
          'building__floor--stopped': stoppingAtFloor === floor
        }">
          
          <button @click="onOrderUp(floor)" class="building__floorButton" :class="{'building__floorButton--selected':floorsOrderedUp.includes(floor) }">&#9650;</button>
          <span>
            {{ floor === 0 ? 'L' : floor }}
          </span> 
          <button @click="onOrderDown(floor)" class="building__floorButton" :class="{'building__floorButton--selected':floorsOrderedDown.includes(floor) }">&#9660;</button>
        </div>
      </div>
      <div class="building__base"></div>



    </section>



    <section id="elevator">
      <div class="elevator__floorButtons">

        <button @click="onChooseFloor(floor)" v-for="floor in floorNumbers" :key="floor" class="elevator__floorButton"
          :class="{
            'elevator__floorButton--selected': selectedFloors.includes(floor)
          }">{{
  floor === 0 ? 'L' : floor }}
        </button>


      </div>
    </section>

  </main>
</template>


