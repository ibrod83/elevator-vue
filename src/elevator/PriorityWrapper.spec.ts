import { describe, it, expect } from 'vitest';
import { PriorityQueueWrapper } from './PriorityQueueWrapper';

// Custom comparator for testing
const numberComparator = (a: number, b: number) => a - b;

describe('PriorityQueueWrapper', () => {
    it('queues and dequeues items correctly', () => {
        const pq = new PriorityQueueWrapper(false, numberComparator);
        pq.queue(10);
        pq.queue(5);
        pq.queue(15);

        expect(pq.dequeue()).toBe(5);
        expect(pq.dequeue()).toBe(10);
        expect(pq.dequeue()).toBe(15);

        expect(pq.length).toBe(0)//
    });

    it('prevents duplicates when shouldPreventDuplicates is true', () => {
        const pq = new PriorityQueueWrapper(true, numberComparator);
        pq.queue(10);
        pq.queue(10);
        pq.queue(5);

        expect(pq.length).toBe(2);
    });

    it('allows duplicates when shouldPreventDuplicates is false', () => {
        const pq = new PriorityQueueWrapper(false, numberComparator);
        pq.queue(10);
        pq.queue(10);
        pq.queue(5);

        expect(pq.length).toBe(3);
    });

    it('peeks at the next item without removing it', () => {//
        const pq = new PriorityQueueWrapper(false, numberComparator);
        pq.queue(10);
        pq.queue(5);

        expect(pq.peek()).toBe(5);
        expect(pq.length).toBe(2); // Length should remain the same after peek
    });

    it('clears the queue correctly', () => {
        const pq = new PriorityQueueWrapper(false, numberComparator);
        pq.queue(10);
        pq.queue(5);
        pq.clear();

        expect(pq.length).toBe(0);
    });

    // Custom comparator for Request objects based on the 'floor' property
    const requestComparator = (a: Request, b: Request) => a.floor - b.floor;

    // Equality check for Request objects
    const requestEqualityCheck = (a: Request, b: Request) => a.floor === b.floor && a.requestDirection === b.requestDirection;

    // Defining the Request type for testing
    type Request = {
        floor: number,
        requestDirection?: 'UP' | 'DOWN'
    };

    it('queues and dequeues Request objects correctly', () => {
        const pq = new PriorityQueueWrapper<Request>(false, requestComparator);
        pq.queue({ floor: 10 });
        pq.queue({ floor: 5, requestDirection: 'UP' });//
        pq.queue({ floor: 15 });

        expect(pq.dequeue()).toEqual({ floor: 5, requestDirection: 'UP' });
        expect(pq.dequeue()).toEqual({ floor: 10 });
        expect(pq.dequeue()).toEqual({ floor: 15 });

        expect(pq.length).toBe(0);
    });

    it('prevents duplicate Request objects when shouldPreventDuplicates is true', () => {
        const pq = new PriorityQueueWrapper<Request>(true, requestComparator, requestEqualityCheck);
        pq.queue({ floor: 10 });
        pq.queue({ floor: 10, requestDirection: 'DOWN' });
        pq.queue({ floor: 10 });

        expect(pq.length).toBe(2); // The third addition is a duplicate and should be ignored
    });

    it('allows duplicate Request objects when shouldPreventDuplicates is false', () => {
        const pq = new PriorityQueueWrapper<Request>(false, requestComparator);
        pq.queue({ floor: 10 });
        pq.queue({ floor: 10, requestDirection: 'DOWN' });
        pq.queue({ floor: 10 });

        expect(pq.length).toBe(3); // All additions are allowed
    });

    it('peeks at the next Request object without removing it', () => {
        const pq = new PriorityQueueWrapper<Request>(false, requestComparator);
        pq.queue({ floor: 10 });
        pq.queue({ floor: 5, requestDirection: 'UP' });

        expect(pq.peek()).toEqual({ floor: 5, requestDirection: 'UP' });
        expect(pq.length).toBe(2);
    });

    it('clears the queue of Request objects correctly', () => {
        const pq = new PriorityQueueWrapper<Request>(false, requestComparator);
        pq.queue({ floor: 10 });
        pq.queue({ floor: 5, requestDirection: 'UP' });
        pq.clear();

        expect(pq.length).toBe(0);
    });
});
