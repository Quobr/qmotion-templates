import React from 'react';
import { interpolate, Easing, useCurrentFrame } from '@qmotion/core';

export interface FullscreenTakeoverProps {
    /** Global frame when the takeover starts */
    triggerFrame: number;
    /** Duration of the expansion in frames @default 32 */
    duration?: number;
    /** Initial state (sidebar preview size/position) */
    from?: {
        scale?: number;
        borderRadius?: number;
        translateX?: number;
        translateY?: number;
    };
    /** Content to show in the fullscreen view */
    children: React.ReactNode;
    /** Overlay content (like play buttons/labels) that fades out during expansion */
    overlay?: React.ReactNode;
}

/**
 * FullscreenTakeover
 * 
 * A transition that expands an element (like a sidebar preview) 
 * to fill the entire screen seamlessly.
 */
export const FullscreenTakeover: React.FC<FullscreenTakeoverProps> = ({
    triggerFrame,
    duration = 32,
    from = {
        scale: 0.4,
        borderRadius: 16,
        translateX: 20,
        translateY: -5
    },
    children,
    overlay
}) => {
    const frame = useCurrentFrame();

    // Only render if we've reached the trigger frame
    if (frame < triggerFrame) return null;

    const progress = interpolate(frame,
        [triggerFrame, triggerFrame + duration],
        [0, 1],
        {
            easing: Easing.easeInOutCubic,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
        }
    );

    // Initial values
    const startScale = from.scale ?? 0.4;
    const startRadius = from.borderRadius ?? 16;
    const startX = from.translateX ?? 20;
    const startY = from.translateY ?? -5;

    // Interpolations
    const scale = interpolate(progress, [0, 1], [startScale, 1]);

    // Position
    const translateX = interpolate(progress, [0, 1], [startX, 0]);
    const translateY = interpolate(progress, [0, 1], [startY, 0]);

    // Border Radius compensation for scale
    // At small scale, we need larger radius to match visual appearance
    const borderRadius = interpolate(progress, [0, 1], [startRadius / scale, 0]);

    // Overlay fades out
    const overlayOpacity = interpolate(progress, [0, 0.5], [1, 0]);

    return (
        <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
                borderRadius,
                transform: `translate(${translateX}%, ${translateY}%) scale(${scale})`,
                transformOrigin: 'center center',
                backgroundColor: '#05050a'
            }}
        >
            {/* Main Content */}
            <div className="absolute inset-0 w-full h-full">
                {children}
            </div>

            {/* Optional Overlay (Play button, labels, etc) */}
            {overlay && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ opacity: overlayOpacity }}
                >
                    {overlay}
                </div>
            )}
        </div>
    );
};
