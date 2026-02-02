import React, { ReactNode, useRef, CSSProperties, forwardRef } from 'react';
import { useSimulatedHover } from '../hooks/useSimulatedHover';

export interface HoverTriggerProps {
    children: ReactNode;
    /** Callback when simulated mouse enters element */
    onHover?: () => void;
    /** Callback when simulated mouse leaves element */
    onLeave?: () => void;
    /** CSS class to add when hovered */
    activeClassName?: string;
    /** Styles to apply when hovered */
    activeStyle?: CSSProperties;
    /** Extra padding around hitbox for easier targeting */
    hitboxPadding?: number;
    /** Base className */
    className?: string;
    /** Base style */
    style?: CSSProperties;
}

/**
 * HoverTrigger - Auto-detects simulated mouse hover
 * 
 * Wraps an element and automatically applies styles/classes when the
 * simulated mouse (from MouseProvider) hovers over it.
 * 
 * @example
 * <HoverTrigger 
 *   activeClassName="bg-blue-600/50"
 *   activeStyle={{ transform: 'scale(1.02)' }}
 * >
 *   <div className="p-4">After Effects 2024</div>
 * </HoverTrigger>
 */
export const HoverTrigger = forwardRef<HTMLDivElement, HoverTriggerProps>(({
    children,
    onHover,
    onLeave,
    activeClassName = '',
    activeStyle = {},
    hitboxPadding = 0,
    className = '',
    style = {}
}, forwardedRef) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = forwardedRef || internalRef;

    // Type guard for ref
    const refObject = typeof ref === 'function' ? internalRef : ref;

    const { isHovered } = useSimulatedHover(refObject, hitboxPadding);

    // TODO: Call onHover/onLeave when state changes
    // This would need useEffect with previous state tracking

    const combinedClassName = `hover-trigger ${className} ${isHovered ? activeClassName : ''}`.trim();

    const combinedStyle: CSSProperties = {
        ...style,
        ...(isHovered ? activeStyle : {}),
        transition: 'all 0.15s ease-out'
    };

    return (
        <div
            ref={refObject}
            className={combinedClassName}
            style={combinedStyle}
        >
            {children}
        </div>
    );
});

HoverTrigger.displayName = 'HoverTrigger';

export default HoverTrigger;
