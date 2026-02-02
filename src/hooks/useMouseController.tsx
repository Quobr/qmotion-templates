import { createContext, useContext, RefObject, ReactNode, useMemo } from 'react';
import { useCurrentFrame, interpolate, Easing } from '@qmotion/core';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MousePosition {
    x: number;
    y: number;
    isClicking: boolean;
}

export interface MouseWaypoint {
    frame: number;
    /** Target: either absolute coords or a ref to an element */
    target: RefObject<HTMLElement> | { x: number; y: number };
    /** Offset from target center */
    offset?: { x: number; y: number };
    /** Trigger click animation at this waypoint */
    onClick?: boolean;
    /** Custom easing for this segment */
    easing?: (t: number) => number;
}

export interface MouseControllerConfig {
    waypoints: MouseWaypoint[];
    /** Organic jitter settings */
    wobble?: {
        amplitude: number;  // pixels (default: 2)
        speed: number;      // frequency multiplier (default: 0.1)
    };
    /** Click animation duration in frames */
    clickDuration?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

const MouseContext = createContext<MousePosition>({
    x: 0,
    y: 0,
    isClicking: false
});

export const useMousePosition = () => useContext(MouseContext);

interface MouseProviderProps {
    children: ReactNode;
    config: MouseControllerConfig;
}

/**
 * MouseProvider - Calculates mouse position from waypoints each frame
 * 
 * Wrap your scene with this to enable <SimulatedMouse> and <HoverTrigger>
 */
export const MouseProvider = ({ children, config }: MouseProviderProps) => {
    const position = useMouseController(config);

    return (
        <MouseContext.Provider value={position}>
            {children}
        </MouseContext.Provider>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK: useMouseController
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculates mouse position from waypoints with organic movement
 */
export function useMouseController(config: MouseControllerConfig): MousePosition {
    const frame = useCurrentFrame();
    const {
        waypoints,
        wobble = { amplitude: 2, speed: 0.1 },
        clickDuration = 8
    } = config;

    return useMemo(() => {
        if (waypoints.length === 0) {
            return { x: 0, y: 0, isClicking: false };
        }

        // Find current segment
        let startWp = waypoints[0];
        let endWp = waypoints[0];
        let segmentIndex = 0;

        for (let i = 0; i < waypoints.length - 1; i++) {
            if (frame >= waypoints[i].frame && frame <= waypoints[i + 1].frame) {
                startWp = waypoints[i];
                endWp = waypoints[i + 1];
                segmentIndex = i;
                break;
            } else if (frame > waypoints[i + 1].frame && i === waypoints.length - 2) {
                // Past all waypoints, stay at last
                startWp = waypoints[i + 1];
                endWp = waypoints[i + 1];
            }
        }

        // Resolve target coordinates
        const resolveTarget = (wp: MouseWaypoint): { x: number; y: number } => {
            if ('current' in wp.target) {
                // It's a ref - for now use center of viewport as fallback
                // In real usage, refs are resolved at render time
                const el = wp.target.current;
                if (el) {
                    const rect = el.getBoundingClientRect();
                    return {
                        x: rect.left + rect.width / 2 + (wp.offset?.x || 0),
                        y: rect.top + rect.height / 2 + (wp.offset?.y || 0)
                    };
                }
                return { x: 960, y: 540 }; // Fallback to center
            }
            return {
                x: wp.target.x + (wp.offset?.x || 0),
                y: wp.target.y + (wp.offset?.y || 0)
            };
        };

        const startPos = resolveTarget(startWp);
        const endPos = resolveTarget(endWp);

        // Interpolate position
        const easing = endWp.easing || Easing.easeInOutQuad;
        const t = startWp.frame === endWp.frame ? 1 :
            interpolate(frame, [startWp.frame, endWp.frame], [0, 1], {
                easing,
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp'
            });

        let x = startPos.x + (endPos.x - startPos.x) * t;
        let y = startPos.y + (endPos.y - startPos.y) * t;

        // Add organic wobble
        const wobbleX = Math.sin(frame * wobble.speed) * wobble.amplitude;
        const wobbleY = Math.cos(frame * wobble.speed * 0.8) * wobble.amplitude;
        x += wobbleX;
        y += wobbleY;

        // Check if clicking (at a waypoint with onClick within clickDuration)
        let isClicking = false;
        for (const wp of waypoints) {
            if (wp.onClick && frame >= wp.frame && frame < wp.frame + clickDuration) {
                isClicking = true;
                break;
            }
        }

        return { x, y, isClicking };
    }, [frame, waypoints, wobble.amplitude, wobble.speed, clickDuration]);
}

export default MouseProvider;
