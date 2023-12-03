import type { ElevatorEventsEnum } from "./types";


type ListenerFunction = (data?: any) => void;

export class EventEmitter {
    private eventListeners: { [event in ElevatorEventsEnum]?: ListenerFunction[] } = {};

    public on(event: ElevatorEventsEnum, listener: ListenerFunction): void {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event]!.push(listener);
    }

    public off(event: ElevatorEventsEnum, listenerToRemove: ListenerFunction): void {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event] = this.eventListeners[event]!.filter(listener => listener !== listenerToRemove);
    }

    protected emit(event: ElevatorEventsEnum, data?: any): void {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event]!.forEach(listener => listener(data));
    }

    public cleanup(): void {
        Object.keys(this.eventListeners).forEach(event => {
            this.eventListeners[event as ElevatorEventsEnum] = [];
        });
    }
}