import React, { ReactNode, CSSProperties } from 'react';
import { useMousePosition } from '../hooks/useMouseController';
import { interpolate } from '@qmotion/core';

export interface SimulatedMouseProps {
    /** Custom cursor component (default: macOS-style arrow) */
    cursor?: ReactNode;
    /** Additional className */
    className?: string;
    /** Z-index for cursor layer (default: 9999) */
    zIndex?: number;
    /** Scale when clicking (default: 0.85) */
    clickScale?: number;
}

/**
 * SimulatedMouse - Visual mouse cursor controlled by MouseProvider
 * 
 * Renders a mouse cursor that follows the position calculated by useMouseController.
 * Includes click animation (scale down) when isClicking is true.
 * 
 * @example
 * <MouseProvider config={{ waypoints: [...] }}>
 *   <ScreenSpace3D>
 *     <YourContent />
 *     <SimulatedMouse />
 *   </ScreenSpace3D>
 * </MouseProvider>
 */
export const SimulatedMouse = ({
    cursor,
    className = '',
    zIndex = 9999,
    clickScale = 0.85
}: SimulatedMouseProps) => {
    const { x, y, isClicking } = useMousePosition();

    const scale = isClicking ? clickScale : 1;

    const style: CSSProperties = {
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${scale})`,
        transformOrigin: '0 0', // Anchor at tip of cursor
        zIndex,
        pointerEvents: 'none',
        transition: isClicking ? 'transform 0.05s ease-out' : 'transform 0.1s ease-out',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
    };

    return (
        <div className={`simulated-mouse ${className}`} style={style}>
            {cursor || <DefaultCursor />}
        </div>
    );
};

/**
 * Default macOS-style cursor
 */
const DefaultCursor = () => (
    <svg width="28" height="28" viewBox="0 0 24 24">
        <path
            d="M5 3l14 11-6 1-4 6-4-18z"
            fill="white"
            stroke="black"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    </svg>
);

export default SimulatedMouse;
