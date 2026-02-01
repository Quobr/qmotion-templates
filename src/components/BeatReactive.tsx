import React, { ReactNode } from 'react';
import { useBeatPulse } from '@qmotion/core';

/**
 * BeatReactive - Wrapper that pulses with the music beat
 * 
 * Makes any content react to the rhythm.
 * 
 * @example
 * <BeatReactive bpm={120} effect="scale" intensity={0.1}>
 *   <Card>Content</Card>
 * </BeatReactive>
 */

export interface BeatReactiveProps {
    children: ReactNode;
    /** Beats per minute of the music */
    bpm?: number;
    /** Type of effect to apply */
    effect?: 'scale' | 'glow' | 'bounce' | 'opacity';
    /** Intensity of the effect (0-1) */
    intensity?: number;
    /** Phase offset for staggered effects (0-1) */
    offset?: number;
    /** Glow color (for 'glow' effect) */
    glowColor?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const BeatReactive = ({
    children,
    bpm = 120,
    effect = 'scale',
    intensity = 0.1,
    offset = 0,
    glowColor = 'rgba(99, 102, 241, 0.5)',
    className = '',
    style = {}
}: BeatReactiveProps) => {
    const pulse = useBeatPulse({ bpm, offset });

    let effectStyle: React.CSSProperties = {};

    switch (effect) {
        case 'scale':
            effectStyle = { transform: `scale(${1 + pulse * intensity})` };
            break;
        case 'glow':
            effectStyle = {
                boxShadow: `0 0 ${pulse * 30 * intensity}px ${glowColor}`,
                filter: `brightness(${1 + pulse * intensity * 0.5})`
            };
            break;
        case 'bounce':
            effectStyle = { transform: `translateY(${-pulse * 20 * intensity}px)` };
            break;
        case 'opacity':
            effectStyle = { opacity: 0.5 + pulse * 0.5 };
            break;
    }

    return (
        <div
            className={className}
            style={{ ...style, ...effectStyle, willChange: 'transform, opacity, filter' }}
        >
            {children}
        </div>
    );
};

export default BeatReactive;
