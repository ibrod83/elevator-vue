import PriorityQueue from "js-priority-queue"


export class PriorityQueueWrapper<T> {

    private shouldPreventDuplicates!: boolean;
    private priorityQueue!: PriorityQueue<T>;
    private currentItems: T[] = [];
    private equalityCheck: (a: T, b: T) => boolean;

    constructor(shouldPreventDuplicates: boolean, priorityComparator?: ((a: T, b: T) => number), equalityCheck?: (a: T, b: T) => boolean) {
        this.shouldPreventDuplicates = shouldPreventDuplicates;
        this.priorityQueue = new PriorityQueue({ comparator: priorityComparator });
        this.equalityCheck = equalityCheck || ((a, b) => a === b); // Default to strict equality for primitives
    }

    get length():number{
        return this.priorityQueue.length
    }

    queue(item: T) {
        if (this.shouldPreventDuplicates && this.doesItemExist(item)) {
            return;
        } else {
            this.priorityQueue.queue(item);
            this.currentItems.push(item);
        }
    }

    peek():T{
        return this.priorityQueue.peek()
    }

    clear():void{
        this.priorityQueue.clear()
    }

    dequeue(): T {
        const currentItem = this.priorityQueue.dequeue();
        this.currentItems = this.currentItems.filter(i => !this.equalityCheck(i, currentItem));
        return currentItem;
    }

    doesItemExist(item: T) {
        return this.currentItems.some(i => this.equalityCheck(i, item));
    }
}
