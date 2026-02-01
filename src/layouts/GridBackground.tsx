import React from 'react';
import { interpolate, Easing, useCurrentFrame } from '@qmotion/core';
import { useCamera } from '@qmotion/core';

export interface GridBackgroundProps {
    /** Base background color or gradient */
    background?: string;
    /** Grid line color */
    gridColor?: string;
    /** Grid cell size in pixels @default 50 */
    gridSize?: number;
    /** Parallax factor (0-1). 1 moves exactly with world (attached), <1 moves slower (background) */
    parallaxFactor?: number;
    /** Whether grid zoom should match camera zoom @default true */
    matchCameraZoom?: boolean;
    /** Custom style overrides */
    style?: React.CSSProperties;
    /** Children to render on top of background but below grid */
    children?: React.ReactNode;
}

/**
 * GridBackground
 * 
 * A camera-aware infinite grid background.
 * Moves with parallax relative to the camera to create depth.
 */
export const GridBackground: React.FC<GridBackgroundProps> = ({
    background = '#0a0a0a',
    gridColor = 'rgba(100, 100, 120, 0.08)',
    gridSize = 50,
    parallaxFactor = 0.95,
    matchCameraZoom = true,
    style,
    children
}) => {
    const { x: camX, y: camY, zoom: camZoom } = useCamera();

    // Invert camera movement for background parallax
    // If factor is 1, it moves exactly opposite to camera (attached to world)
    // If factor is < 1 (e.g. 0.95), it moves slightly slower than world (distant floor)
    const gridX = -camX * parallaxFactor;
    const gridY = -camY * parallaxFactor;

    const scale = matchCameraZoom ? camZoom : 1;

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background, ...style }}>
            {children}

            <div
                className="absolute pointer-events-none"
                style={{
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    backgroundImage: `
                        linear-gradient(${gridColor} 1px, transparent 1px),
                        linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
                    `,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                    backgroundPosition: '0 0',
                    transform: `translate(${gridX}px, ${gridY}px) scale(${scale})`,
                    transformOrigin: 'center center'
                }}
            />
        </div>
    );
};
