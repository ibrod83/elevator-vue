import { describe, it, expect } from 'vitest';
import { PriorityQueueWrapper } from './PriorityQueueWrapper';

// Custom comparator for testing
const numberComparator = (a:number, b:number) => a - b;

describe('PriorityQueueWrapper', () => {
    it('queues and dequeues items correctly', () => {
        const pq = new PriorityQueueWrapper(false, numberComparator);
        pq.queue(10);
        pq.queue(5);
        pq.queue(15);

        expect(pq.dequeue()).toBe(5);
        expect(pq.dequeue()).toBe(10);
        expect(pq.dequeue()).toBe(15);
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
});
