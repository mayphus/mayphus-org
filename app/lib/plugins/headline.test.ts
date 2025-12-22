import { describe, it, expect } from 'vitest';
import { customHeadline } from './headline';

describe('customHeadline', () => {
    it('increments headline level by 1', () => {
        const tree = {
            type: 'root',
            children: [
                { type: 'headline', level: 1 },
                { type: 'headline', level: 2 },
                { type: 'headline', level: 5 },
            ],
        };

        const plugin = customHeadline();
        plugin(tree as any);

        expect((tree.children[0] as any).level).toBe(2);
        expect((tree.children[1] as any).level).toBe(3);
        expect((tree.children[2] as any).level).toBe(6);
    });

    it('does not increment level beyond 6', () => {
        const tree = {
            type: 'root',
            children: [
                { type: 'headline', level: 6 },
            ],
        };

        const plugin = customHeadline();
        plugin(tree as any);

        expect((tree.children[0] as any).level).toBe(6);
    });
});
