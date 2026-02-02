import { RefObject, useMemo } from 'react';
import { useCurrentFrame } from '@qmotion/core';
import { useMousePosition } from './useMouseController';

export interface SimulatedHoverResult {
    isHovered: boolean;
    /** Distance from mouse to element center (for proximity effects) */
    distance: number;
    /** Frame when hover started (for animations) */
    hoverStartFrame: number | null;
}

/**
 * useSimulatedHover - Detect if simulated mouse is over an element
 * 
 * @param ref - Ref to the element to check hover for
 * @param hitboxPadding - Extra pixels around element for easier targeting
 * 
 * @example
 * const buttonRef = useRef(null);
 * const { isHovered } = useSimulatedHover(buttonRef);
 * 
 * <button 
 *   ref={buttonRef} 
 *   className={isHovered ? 'bg-blue-500' : 'bg-gray-500'}
 * >
 *   Hover me
 * </button>
 */
export function useSimulatedHover(
    ref: RefObject<HTMLElement>,
    hitboxPadding: number = 0
): SimulatedHoverResult {
    const frame = useCurrentFrame();
    const mousePos = useMousePosition();

    return useMemo(() => {
        if (!ref.current) {
            return { isHovered: false, distance: Infinity, hoverStartFrame: null };
        }

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance
        const dx = mousePos.x - centerX;
        const dy = mousePos.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if mouse is within padded bounding box
        const isHovered =
            mousePos.x >= rect.left - hitboxPadding &&
            mousePos.x <= rect.right + hitboxPadding &&
            mousePos.y >= rect.top - hitboxPadding &&
            mousePos.y <= rect.bottom + hitboxPadding;

        // TODO: Track hoverStartFrame with useState for animation timing
        // This simplified version doesn't track it across frames
        const hoverStartFrame = isHovered ? frame : null;

        return { isHovered, distance, hoverStartFrame };
    }, [frame, mousePos.x, mousePos.y, ref, hitboxPadding]);
}

export default useSimulatedHover;
