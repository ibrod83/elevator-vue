import PriorityQueue from "js-priority-queue"
import { EventEmitter } from "./EventEmitter"

export class PriorityQueueWrapper<T> extends EventEmitter{

    private shouldPreventDuplicates!:boolean
    private priorityQueue!:PriorityQueue<T>
    private currentItems:T[] = []

    constructor(shouldPreventDuplicates:boolean,comparator?:((a: T, b: T) => number)){
        super();
        this.shouldPreventDuplicates = shouldPreventDuplicates
        this.priorityQueue =  new PriorityQueue({comparator})
    }
    get length():number{
        return this.priorityQueue.length
    }

    queue(item:T){
        if(this.shouldPreventDuplicates && this.currentItems.includes(item)){
         return
        }else{
            this.priorityQueue.queue(item)
            this.currentItems.push(item)
            console.log(this.queue.length)
            if(this.length === 1){
             this.emit('FIRST_ITEM_ADDED')  
            }
        }
        
        
    }
    dequeue():T{        
        const currentItem =  this.priorityQueue.dequeue()
        console.log(this.queue.length)
        this.currentItems = this.currentItems.filter(i=>i===currentItem)
        return currentItem
    }
    peek():T{
        return this.priorityQueue.peek()
    }

    clear():void{
        this.priorityQueue.clear()
    }
}