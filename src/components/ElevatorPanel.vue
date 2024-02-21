<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps({
    floorNumbers: Array<number>,
    selectedFloors: Array<number>
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
    <div class="elevator">
        <div class="elevator__floorButtons">
            <button @click="onChooseFloor(floor)" v-for="floor in floorNumbers" class="elevator__floorButton" :class="{
                'elevator__floorButton--selected': selectedFloors?.includes(floor)
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
</template>