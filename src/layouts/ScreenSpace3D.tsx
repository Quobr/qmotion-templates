import React, { ReactNode, CSSProperties } from 'react';
import { useMousePosition } from '../hooks/useMouseController';
import { interpolate } from '@qmotion/core';

export interface ScreenSpace3DProps {
    children: ReactNode;
    /** CSS perspective value in pixels (default: 1000) */
    fov?: number;
    /** Parallax strength multiplier (default: 0.05) - how much scene moves opposite to mouse */
    parallaxStrength?: number;
    /** Enable camera following mouse (default: true) */
    followMouse?: boolean;
    /** Viewport dimensions for parallax calculation */
    viewport?: { width: number; height: number };
    /** Additional className */
    className?: string;
    /** Additional styles */
    style?: CSSProperties;
}

/**
 * ScreenSpace3D - 2.5D Perspective Container with Parallax
 * 
 * Creates a perspective container where content lives in a pseudo-3D space.
 * When `followMouse` is enabled, the camera subtly follows the simulated mouse
 * creating a parallax effect that adds depth.
 * 
 * @example
 * <MouseProvider config={{ waypoints: [...] }}>
 *   <ScreenSpace3D fov={1000} parallaxStrength={0.1}>
 *     <DesktopUI />
 *     <SimulatedMouse />
 *   </ScreenSpace3D>
 * </MouseProvider>
 */
export const ScreenSpace3D = ({
    children,
    fov = 1000,
    parallaxStrength = 0.05,
    followMouse = true,
    viewport = { width: 1920, height: 1080 },
    className = '',
    style = {}
}: ScreenSpace3DProps) => {
    const mousePos = useMousePosition();

    // Calculate parallax offset (inverse of mouse movement)
    let offsetX = 0;
    let offsetY = 0;

    if (followMouse) {
        // Normalize mouse position to -1 to 1 range
        const normalizedX = (mousePos.x / viewport.width) * 2 - 1;
        const normalizedY = (mousePos.y / viewport.height) * 2 - 1;

        // Invert for parallax effect (camera moves opposite)
        offsetX = -normalizedX * viewport.width * parallaxStrength;
        offsetY = -normalizedY * viewport.height * parallaxStrength;
    }

    const containerStyle: CSSProperties = {
        position: 'absolute',
        inset: 0,
        perspective: `${fov}px`,
        perspectiveOrigin: '50% 50%',
        overflow: 'hidden',
        ...style
    };

    const sceneStyle: CSSProperties = {
        position: 'absolute',
        inset: 0,
        transformStyle: 'preserve-3d',
        transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
        transition: 'transform 0.1s ease-out'
    };

    return (
        <div className={`screenspace-3d ${className}`} style={containerStyle}>
            <div className="screenspace-3d-scene" style={sceneStyle}>
                {children}
            </div>
        </div>
    );
};

export default ScreenSpace3D;
