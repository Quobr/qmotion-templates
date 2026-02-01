import React, { ReactNode, Children, isValidElement, cloneElement } from 'react';
import { use3DTransform, Easing, interpolate, useCurrentFrame } from '@qmotion/core';

/**
 * MaskedReveal - Apple's "Invisible Box" effect
 * 
 * 90% of Apple's text doesn't fade in. It slides out of a hidden box.
 * The text starts below/above the visible area and slides into view.
 * 
 * @example
 * <MaskedReveal startFrame={0} endFrame={30}>
 *   <h1>This text reveals from below</h1>
 * </MaskedReveal>
 * 
 * // With multiple lines (auto-stagger)
 * <MaskedReveal startFrame={0} stagger>
 *   <p>Line one</p>
 *   <p>Line two</p>
 *   <p>Line three</p>
 * </MaskedReveal>
 */

export interface MaskedRevealProps {
    children: ReactNode;
    /** Frame to start the reveal */
    startFrame?: number;
    /** Frame to end the reveal (duration = endFrame - startFrame) */
    endFrame?: number;
    /** Direction of reveal */
    direction?: 'up' | 'down';
    /** Apply stagger to child elements */
    stagger?: boolean;
    /** Stagger delay in frames between elements */
    staggerDelay?: number;
    /** Also animate letter-spacing (Apple's tracking effect) */
    animateTracking?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const MaskedReveal = ({
    children,
    startFrame = 0,
    endFrame = 30,
    direction = 'up',
    stagger = false,
    staggerDelay = 5,
    animateTracking = false,
    className = '',
    style = {}
}: MaskedRevealProps) => {
    const frame = useCurrentFrame();
    const duration = endFrame - startFrame;

    // Convert children to array for staggering
    const childArray = Children.toArray(children);

    if (stagger && childArray.length > 1) {
        // Render each child with staggered timing
        return (
            <div className={className} style={style}>
                {childArray.map((child, index) => (
                    <MaskedRevealItem
                        key={index}
                        startFrame={startFrame + (index * staggerDelay)}
                        duration={duration}
                        direction={direction}
                        animateTracking={animateTracking}
                    >
                        {child}
                    </MaskedRevealItem>
                ))}
            </div>
        );
    }

    // Single item reveal
    return (
        <MaskedRevealItem
            startFrame={startFrame}
            duration={duration}
            direction={direction}
            animateTracking={animateTracking}
            className={className}
            style={style}
        >
            {children}
        </MaskedRevealItem>
    );
};

interface MaskedRevealItemProps {
    children: ReactNode;
    startFrame: number;
    duration: number;
    direction: 'up' | 'down';
    animateTracking?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const MaskedRevealItem = ({
    children,
    startFrame,
    duration,
    direction,
    animateTracking = false,
    className = '',
    style = {}
}: MaskedRevealItemProps) => {
    const frame = useCurrentFrame();

    // Calculate progress
    const progress = Math.max(0, Math.min(1, (frame - startFrame) / duration));

    // Apple's text reveal easing (expo.out - fast arrival)
    const easedProgress = Easing.easeOutExpo(progress);

    // Y translation: 110% to 0%
    const yPercent = direction === 'up'
        ? 110 * (1 - easedProgress)
        : -110 * (1 - easedProgress);

    // Opacity: Quick 0 to 1
    const opacity = Math.min(1, progress * 3); // Reaches 1 at 33% progress

    // Letter spacing (tracking animation)
    const letterSpacing = animateTracking
        ? `${-0.05 + easedProgress * 0.05}em`
        : undefined;

    return (
        <div
            className={className}
            style={{
                overflow: 'hidden',
                ...style
            }}
        >
            <div
                style={{
                    transform: `translateY(${yPercent}%)`,
                    opacity,
                    letterSpacing,
                    willChange: 'transform, opacity'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default MaskedReveal;
