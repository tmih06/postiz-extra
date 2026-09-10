import type { HTMLAttributes } from 'react';

/**
 * Base properties supported by all interactive animated icon components.
 *
 * Extends standard HTML div element attributes to allow embedding within navigation links,
 * action buttons, or standalone toolbars while providing dedicated controls for icon dimension,
 * custom styling, and external hover state synchronisation.
 *
 * @property size - Icon viewport dimension in pixels (width and height). Defaults to 18px in most components.
 * @property className - Optional CSS classes merged into the outer wrapping container.
 * @property isHovered - External hover trigger override. When `true`, activates the looping animation state.
 *
 * @example
 * ```tsx
 * <AnimatedSquarePen size={20} isHovered={isParentHovered} className="text-primary" />
 * ```
 */
export interface AnimatedIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  className?: string;
  isHovered?: boolean;
}
