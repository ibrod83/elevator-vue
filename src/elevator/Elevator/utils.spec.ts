import { describe, it, expect } from 'vitest';
import { DesignatedDirectionEnum } from '..';
import { getTotalDistanceToDestination } from './utils';
// import { getTotalDistanceToDestination, DesignatedDirectionEnum } from './path-to-your-elevator-module';

describe('getTotalDistanceToDestination', () => {
    it('should handle idle state correctly', () => {
        const result = getTotalDistanceToDestination(5, DesignatedDirectionEnum.IDLE, [], [], [], 2);
        expect(result).toBe(3); // 5 to 2 is 3 floors
    });

    it('should calculate floors for upward movement correctly', () => {
        const result = getTotalDistanceToDestination(3, DesignatedDirectionEnum.DESIGNATED_UP, [], [6, 8], [7], 2);
        expect(result).toBe(11); // 3 to 8 (5 floors), then 8 to 2 (6 floors)
    });

    it('should calculate floors for downward movement correctly', () => {
        const result = getTotalDistanceToDestination(10, DesignatedDirectionEnum.DESIGNATED_DOWN, [1, 3], [], [], 5);
        expect(result).toBe(13); // 10 to 1 (9 floors), then 1 to 5 (4 floors)
    });

    it('should handle negative floors correctly', () => {
        const result = getTotalDistanceToDestination(-2, DesignatedDirectionEnum.DESIGNATED_UP, [], [-1, 1], [], -3);
        expect(result).toBe(7); // -2 to 1 (3 floors), then 1 to -3 (4 floors)
    });

    it('should handle a mix of positive and negative floors', () => {
        const result = getTotalDistanceToDestination(-5, DesignatedDirectionEnum.DESIGNATED_DOWN, [-10], [0, 5], [], -2);
        expect(result).toBe(13); // -5 to -10 (5 floors), then -10 to -2 (8 floors)
    });
});
