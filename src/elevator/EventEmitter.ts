import type { ElevatorEventsEnum } from "./types";


type ListenerFunction = (data?: any) => void;

export class EventEmitter {
    // private eventListeners: { [event in T]?: ListenerFunction[] } = {};
    private eventListeners: {[index:string]: ListenerFunction[]} = {}

    public on(event: string, listener: ListenerFunction): void {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event]!.push(listener);
    }

    public off(event: string, listenerToRemove: ListenerFunction): void {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event] = this.eventListeners[event]!.filter(listener => listener !== listenerToRemove);
    }

    protected emit(event: string, data?: any): void {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event]!.forEach(listener => listener(data)) }

    public cleanup(): void {
        Object.keys(this.eventListeners).forEach(event => {
            this.eventListeners[event] = [];
        });
    }
}