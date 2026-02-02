import React, { ReactNode, CSSProperties } from 'react';
import { useMousePosition } from '../hooks/useMouseController';

export interface ScreenSpace3DProps {
    children: ReactNode;
    /** CSS perspective value in pixels (default: 1000) */
    fov?: number;
    /** Parallax translation strength (default: 0.05) */
    parallaxStrength?: number;
    /** Parallax rotation strength in degrees (default: 2) - Adds subtle 3D rotation */
    rotateStrength?: number;
    /** Enable camera following target (default: true) */
    follow?: boolean;
    /** Optional custom target to follow instead of mouse {x, y} */
    target?: { x: number, y: number };
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
 * The camera can follow the mouse or a custom target, applying both
 * translation and rotation parallax for a "looking through window" effect.
 */
export const ScreenSpace3D = ({
    children,
    fov = 1000,
    parallaxStrength = 0.05,
    rotateStrength = 0, // Set to ~2-5 for nice 3D tilt
    follow = true,
    target,
    viewport = { width: 1920, height: 1080 },
    className = '',
    style = {}
}: ScreenSpace3DProps) => {
    // 1. Determine target source (custom or mouse provider)
    const mousePos = useMousePosition();
    const activeTarget = target || (follow ? mousePos : { x: viewport.width / 2, y: viewport.height / 2 });

    let offsetX = 0;
    let offsetY = 0;
    let rotateX = 0;
    let rotateY = 0;

    if (follow) {
        // Normalize position to -1 to 1 range relative to center
        const normalizedX = (activeTarget.x / viewport.width) * 2 - 1;
        const normalizedY = (activeTarget.y / viewport.height) * 2 - 1;

        // Translation Parallax (Camera moves opposite to target)
        offsetX = -normalizedX * viewport.width * parallaxStrength;
        offsetY = -normalizedY * viewport.height * parallaxStrength;

        // Rotation Parallax (Look at target)
        // If target is top-left (-1, -1), we should rotate X up (negative?) and Y left (positive?)
        // Standard CSS rotate3d: 
        // rotateY positive = right side moves back (looking left)
        // rotateX positive = bottom side moves back (looking up)
        rotateY = normalizedX * rotateStrength;
        rotateX = -normalizedY * rotateStrength;
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
        // Apply translation first, then rotation
        transform: `
            translate3d(${offsetX}px, ${offsetY}px, 0) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
        `,
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
