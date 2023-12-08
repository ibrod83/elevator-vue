import PriorityQueue from "js-priority-queue"
import { EventEmitter } from "./EventEmitter"

export class PriorityQueueWrapper<T>{

    private shouldPreventDuplicates!:boolean
    private priorityQueue!:PriorityQueue<T>
    private currentItems:T[] = []

    constructor(shouldPreventDuplicates:boolean,comparator?:((a: T, b: T) => number)){
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
            console.log('ENQUEUE','item: ',item, 'length: ', this.queue.length)
            
        }
        
        
    }
    dequeue():T{        
        const currentItem =  this.priorityQueue.dequeue()
       
        this.currentItems = this.currentItems.filter(i=>i!==currentItem)
        console.log('DEQUEUE','current: ',currentItem, 'length: ', this.queue.length)
        return currentItem
    }
    peek():T{
        return this.priorityQueue.peek()
    }

    clear():void{
        this.priorityQueue.clear()
    }

    doesItemExist(item:T){
        return this.currentItems.includes(item)
    }
}