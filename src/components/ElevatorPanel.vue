<script lang="ts" setup>
import { DesignatedDirectionEnum } from '@/logic';

// import { defineProps } from 'vue'

const props = defineProps({
    floorNumbers: Array<number>,
    selectedFloors: Array<number>,
    currentFloor: Number,
    designatedDirection: String,
   
});

const emit = defineEmits<{
    (e: 'onChooseFloor', id: number): void
    (e: 'onOpenDoor'): void
    (e: 'onCloseDoor'): void
}>()

const onChooseFloor = (floor: number) => {
    emit('onChooseFloor', floor)
}

const onOpenDoor = () => {
    emit('onOpenDoor')
}

const onCloseDoor = () => {
    emit('onCloseDoor')
}

</script>

<template>
    
        <div class="elevator-panel__indicators">
            <div class="elevator-panel__floor-number">{{ currentFloor || "L" }}</div>
            <!-- <div class="elevator-panel__direction-indicator"> &#9650;</div> -->
            <!-- <div  class="elevator-panel__direction-indicator elevator-panel__direction-indicator--up"></div> -->
            <div v-if="designatedDirection === DesignatedDirectionEnum.DESIGNATED_UP" class="elevator-panel__direction-indicator elevator-panel__direction-indicator--up"></div>
            <div v-if="designatedDirection === DesignatedDirectionEnum.DESIGNATED_DOWN" class="elevator-panel__direction-indicator elevator-panel__direction-indicator--down"></div>
            <div v-if="designatedDirection === DesignatedDirectionEnum.IDLE" class="elevator-panel__direction-indicator"></div>
        </div>
        <div class="elevator-panel__floor-buttons">
            <button @click="onChooseFloor(floor)" v-for="floor in floorNumbers"
                class="button elevator-panel__floor-button" :class="{
                'elevator-panel__floor-button--selected': selectedFloors?.includes(floor)
            }">{{ floor === 0 ? 'L' : floor }}
            </button>

        </div>
        <div class="elevator-panel__action-buttons">
            <button class="button elevator-panel__action ">
                <span class=" material-symbols-outlined">
                    crisis_alert
                </span>
            </button>

            <button @click="onCloseDoor()" class="button elevator-panel__action elevator-panel__action--closeDoor">
                <div>
                    &#9654;
                </div><div>
                    &#9664;
                </div>

            </button>
            <button @click="onOpenDoor()" class="button elevator-panel__action elevator-panel__action--openDoor">
                <div>
                    &#9664;
                </div>
                <div >
                    &#9654;

                </div>
            </button>
        </div>
   
</template>