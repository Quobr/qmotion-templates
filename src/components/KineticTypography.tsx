import React, { ReactNode } from 'react';
import { useCurrentFrame, Easing, interpolate } from '@qmotion/core';

/**
 * KineticTypography - Apple-style animated text
 * 
 * Features:
 * - Letter-spacing animation (tracking "decompression")
 * - Color sync capability
 * - Split by character or word animation
 * 
 * @example
 * <KineticTypography
 *   startFrame={0}
 *   endFrame={45}
 *   as="h1"
 *   className="text-7xl font-bold"
 * >
 *   Hello Motion
 * </KineticTypography>
 */

export interface KineticTypographyProps {
    children: string;
    /** Element type to render */
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
    /** Frame to start animation */
    startFrame?: number;
    /** Frame to end animation */
    endFrame?: number;
    /** Split animation by character or word */
    splitBy?: 'char' | 'word' | 'none';
    /** Starting letter-spacing */
    trackingStart?: string;
    /** Ending letter-spacing */
    trackingEnd?: string;
    /** Starting color */
    colorStart?: string;
    /** Ending color */
    colorEnd?: string;
    /** Direction of slide */
    slideDirection?: 'up' | 'down' | 'left' | 'right' | 'none';
    /** Slide distance in pixels */
    slideDistance?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const KineticTypography = ({
    children,
    as: Component = 'span',
    startFrame = 0,
    endFrame = 30,
    splitBy = 'none',
    trackingStart = '-0.05em',
    trackingEnd = '0em',
    colorStart,
    colorEnd,
    slideDirection = 'up',
    slideDistance = 40,
    className = '',
    style = {}
}: KineticTypographyProps) => {
    const frame = useCurrentFrame();
    const duration = endFrame - startFrame;

    if (splitBy === 'none') {
        return (
            <KineticText
                text={children}
                as={Component}
                startFrame={startFrame}
                duration={duration}
                trackingStart={trackingStart}
                trackingEnd={trackingEnd}
                colorStart={colorStart}
                colorEnd={colorEnd}
                slideDirection={slideDirection}
                slideDistance={slideDistance}
                className={className}
                style={style}
            />
        );
    }

    // Split by char or word
    const parts = splitBy === 'char'
        ? children.split('')
        : children.split(' ');

    const staggerDelay = 2; // frames between each part

    return (
        <Component className={className} style={style}>
            {parts.map((part, index) => (
                <KineticText
                    key={index}
                    text={part + (splitBy === 'word' && index < parts.length - 1 ? ' ' : '')}
                    as="span"
                    startFrame={startFrame + (index * staggerDelay)}
                    duration={duration}
                    trackingStart={trackingStart}
                    trackingEnd={trackingEnd}
                    colorStart={colorStart}
                    colorEnd={colorEnd}
                    slideDirection={slideDirection}
                    slideDistance={slideDistance}
                    style={{ display: 'inline-block' }}
                />
            ))}
        </Component>
    );
};

interface KineticTextProps {
    text: string;
    as: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
    startFrame: number;
    duration: number;
    trackingStart: string;
    trackingEnd: string;
    colorStart?: string;
    colorEnd?: string;
    slideDirection: 'up' | 'down' | 'left' | 'right' | 'none';
    slideDistance: number;
    className?: string;
    style?: React.CSSProperties;
}

const KineticText = ({
    text,
    as: Component,
    startFrame,
    duration,
    trackingStart,
    trackingEnd,
    colorStart,
    colorEnd,
    slideDirection,
    slideDistance,
    className = '',
    style = {}
}: KineticTextProps) => {
    const frame = useCurrentFrame();

    const progress = Math.max(0, Math.min(1, (frame - startFrame) / duration));
    const easedProgress = Easing.easeOutExpo(progress);

    // Letter spacing interpolation
    const trackingStartVal = parseFloat(trackingStart);
    const trackingEndVal = parseFloat(trackingEnd);
    const letterSpacing = `${trackingStartVal + (trackingEndVal - trackingStartVal) * easedProgress}em`;

    // Slide transform
    let transform = '';
    const slideAmount = slideDistance * (1 - easedProgress);
    switch (slideDirection) {
        case 'up': transform = `translateY(${slideAmount}px)`; break;
        case 'down': transform = `translateY(${-slideAmount}px)`; break;
        case 'left': transform = `translateX(${slideAmount}px)`; break;
        case 'right': transform = `translateX(${-slideAmount}px)`; break;
        case 'none': transform = 'none'; break;
    }

    // Opacity
    const opacity = Math.min(1, progress * 2.5);

    return (
        <Component
            className={className}
            style={{
                letterSpacing,
                transform,
                opacity,
                color: colorStart && colorEnd
                    ? `color-mix(in srgb, ${colorStart} ${(1 - easedProgress) * 100}%, ${colorEnd})`
                    : undefined,
                willChange: 'transform, opacity, letter-spacing',
                ...style
            }}
        >
            {text}
        </Component>
    );
};

export default KineticTypography;
