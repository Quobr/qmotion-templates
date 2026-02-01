import React, { ReactNode } from 'react';
import { useCurrentFrame, useParallax } from '@qmotion/core';

/**
 * ParallaxGlass - Apple-style glassmorphism with parallax
 * 
 * High saturation glassmorphism that reacts to scroll/movement.
 * The key to Apple's look: saturate(180%) and interior border.
 * 
 * @example
 * <ParallaxGlass>
 *   <Card>Content</Card>
 * </ParallaxGlass>
 */

export interface ParallaxGlassProps {
    children: ReactNode;
    /** Blur intensity (default 40) */
    blur?: number;
    /** Saturation (default 180 - Apple's vibrant look) */
    saturation?: number;
    /** Background opacity (0-1) */
    bgOpacity?: number;
    /** Enable parallax movement inside glass */
    parallaxContent?: boolean;
    /** Parallax speed multiplier */
    parallaxSpeed?: number;
    /** Theme */
    theme?: 'light' | 'dark';
    /** Border radius */
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    className?: string;
    style?: React.CSSProperties;
}

const roundedMap = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '30px',
    full: '9999px'
};

export const ParallaxGlass = ({
    children,
    blur = 40,
    saturation = 180,
    bgOpacity = 0.4,
    parallaxContent = true,
    parallaxSpeed = 0.3,
    theme = 'dark',
    rounded = 'xl',
    className = '',
    style = {}
}: ParallaxGlassProps) => {
    const { x, y } = useParallax({ speed: parallaxSpeed, amplitude: 20 });

    const bgColor = theme === 'dark'
        ? `rgba(0, 0, 0, ${bgOpacity})`
        : `rgba(255, 255, 255, ${bgOpacity})`;

    const borderColor = theme === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 0.3)';

    return (
        <div
            className={className}
            style={{
                backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: roundedMap[rounded],
                boxShadow: theme === 'dark'
                    ? '0 20px 40px rgba(0,0,0,0.3)'
                    : '0 20px 40px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                ...style
            }}
        >
            <div
                style={{
                    transform: parallaxContent ? `translate(${x}px, ${y}px)` : undefined,
                    willChange: parallaxContent ? 'transform' : undefined
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ParallaxGlass;
