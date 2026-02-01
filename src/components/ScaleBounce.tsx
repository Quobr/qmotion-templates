import React, { ReactNode } from 'react';
import { useCurrentFrame, useBeatPulse, Easing } from '@qmotion/core';

/**
 * ScaleBounce - Apple's micro-interaction for buttons/cards
 * 
 * On "click" (trigger frame):
 * - Down: Scale to 0.96 (fast)
 * - Up: Scale to 1.02 then 1.0 (soft overshoot)
 * 
 * Never scale text alone - scale the entire container.
 * 
 * @example
 * <ScaleBounce triggerFrame={30}>
 *   <Button>Click Me</Button>
 * </ScaleBounce>
 */

export interface ScaleBounceProps {
    children: ReactNode;
    /** Frame at which the "click" happens */
    triggerFrame: number;
    /** Duration of down phase (frames) */
    downDuration?: number;
    /** Duration of up phase (frames) */
    upDuration?: number;
    /** Scale when pressed */
    pressScale?: number;
    /** Scale at overshoot peak */
    overshootScale?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const ScaleBounce = ({
    children,
    triggerFrame,
    downDuration = 5,
    upDuration = 15,
    pressScale = 0.96,
    overshootScale = 1.02,
    className = '',
    style = {}
}: ScaleBounceProps) => {
    const frame = useCurrentFrame();

    let scale = 1;

    const relativeFrame = frame - triggerFrame;

    if (relativeFrame >= 0 && relativeFrame < downDuration) {
        // Down phase: 1 -> pressScale
        const progress = relativeFrame / downDuration;
        const eased = Easing.easeOutQuad(progress);
        scale = 1 + (pressScale - 1) * eased;
    } else if (relativeFrame >= downDuration && relativeFrame < downDuration + upDuration) {
        // Up phase: pressScale -> overshootScale -> 1
        const upProgress = (relativeFrame - downDuration) / upDuration;

        if (upProgress < 0.4) {
            // First part: pressScale -> overshootScale
            const p = upProgress / 0.4;
            const eased = Easing.easeOutQuad(p);
            scale = pressScale + (overshootScale - pressScale) * eased;
        } else {
            // Second part: overshootScale -> 1
            const p = (upProgress - 0.4) / 0.6;
            const eased = Easing.easeOutQuad(p);
            scale = overshootScale + (1 - overshootScale) * eased;
        }
    }

    return (
        <div
            className={className}
            style={{
                transform: `scale(${scale})`,
                willChange: 'transform',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default ScaleBounce;
