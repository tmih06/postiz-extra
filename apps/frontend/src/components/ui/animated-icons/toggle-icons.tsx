'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { AnimatedIconProps } from './types';
import { useIconLoop } from './use-icon-loop';

/**
 * Properties for the {@link AnimatedThemeToggle} component.
 *
 * @property isDark - Current theme mode; controls whether sun (`false`) or moon (`true`) is rendered.
 */
export interface AnimatedThemeToggleProps extends Omit<AnimatedIconProps, 'children'> {
  isDark: boolean;
}

/**
 * Animated theme toggle icon rendering a smooth morph between Sun (light mode) and Moon (dark mode).
 *
 * Feature requirements & motion behaviors:
 * - **Toggle Transition**: Uses `<AnimatePresence mode="wait">` to transition between Sun and Moon states with
 *   spring-based rotation and scaling (`initial: rotate -90, scale 0` -> `animate: rotate 0, scale 1` -> `exit: rotate 90, scale 0`).
 * - **Sun Hover**: Main sun center undergoes a continuous 360° rotation loop while outer ray paths pulse in opacity (0.4 to 1.0)
 *   and stroke width (2.0 to 2.4).
 * - **Moon Hover**: Moon crescent rocks with subtle tilt (-12° to 12°) and pop scale (1.0 to 1.15) alongside twinkling stars.
 * - Supports internal hover tracking and external `isHovered` prop synchronization with 2-second resting loop cycles.
 *
 * @param props - Component properties including `isDark`, dimensions (`size`), custom styles (`className`), and hover events.
 * @returns Rendered animated theme toggle element.
 */
export function AnimatedThemeToggle({
  isDark,
  size,
  className,
  isHovered: externalHovered,
  onMouseEnter,
  onMouseLeave,
  ...props
}: AnimatedThemeToggleProps) {
  const [internalHovered, setInternalHovered] = useState(false);
  const active = externalHovered || internalHovered;
  const controls = useIconLoop(active);

  return (
    <div
      className={cn('inline-flex items-center justify-center shrink-0 relative', className)}
      style={size ? { width: size, height: size } : undefined}
      onMouseEnter={(e) => {
        setInternalHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setInternalHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          // In dark mode: Show SUN (clicking switches to light)
          <motion.div
            key="sun"
            initial={{ scale: 0.2, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.2, rotate: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="size-full flex items-center justify-center"
          >
            <svg
              className="size-full"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Sun center circle */}
              <circle cx="12" cy="12" r="4" />
              {/* 8 Sun rays that shimmer in full loop while hovered */}
              <motion.g
                animate={controls}
                variants={{
                  normal: { rotate: 0 },
                  animate: {
                    rotate: [0, 20, -15, 0],
                    transition: { duration: 0.7, ease: 'easeInOut' },
                  },
                }}
                style={{ originX: '12px', originY: '12px' }}
              >
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
              </motion.g>
            </svg>
          </motion.div>
        ) : (
          // In light mode: Show MOON (clicking switches to dark)
          <motion.div
            key="moon"
            initial={{ scale: 0.2, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.2, rotate: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="size-full flex items-center justify-center"
          >
            <motion.svg
              className="size-full"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={controls}
              variants={{
                normal: { rotate: 0 },
                animate: {
                  rotate: [0, -12, 12, -4, 0],
                  transition: { duration: 0.7, ease: 'easeInOut' },
                },
              }}
              style={{ originX: '12px', originY: '12px' }}
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Properties for the {@link AnimatedCollapseToggle} component.
 *
 * @property collapsed - Collapsed state of the sidebar or drawer; controls arrow orientation and container layout.
 */
export interface AnimatedCollapseToggleProps extends Omit<AnimatedIconProps, 'children'> {
  collapsed: boolean;
}

/**
 * Animated sidebar collapse/expand toggle icon.
 *
 * Feature requirements & motion behaviors:
 * - **Collapse State Morph**: Renders a panel boundary with a directional chevron. When `collapsed` changes,
 *   the chevron flips 180° via spring rotation (`collapsed ? 180 : 0`).
 * - **Hover Feedback**: On hover, the directional chevron slides horizontally (`x: [0, -3, 0]` when expanded, `x: [0, 3, 0]` when collapsed)
 *   with a spring bounce to visually signal the collapsible collapse/expand direction.
 * - Supports internal hover tracking and external `isHovered` prop synchronisation via {@link useIconLoop}.
 *
 * @param props - Component properties including `collapsed`, dimensions (`size`), custom styles (`className`), and hover events.
 * @returns Rendered animated collapse toggle element.
 */
export function AnimatedCollapseToggle({
  collapsed,
  size,
  className,
  isHovered: externalHovered,
  onMouseEnter,
  onMouseLeave,
  ...props
}: AnimatedCollapseToggleProps) {
  const [internalHovered, setInternalHovered] = useState(false);
  const active = externalHovered || internalHovered;
  const controls = useIconLoop(active);

  return (
    <div
      className={cn('inline-flex items-center justify-center shrink-0', className)}
      style={size ? { width: size, height: size } : undefined}
      onMouseEnter={(e) => {
        setInternalHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setInternalHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    >
      <svg
        className="size-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Outer panel window */}
        <rect height="18" rx="2" width="18" x="3" y="3" />
        {/* Sidebar partition line */}
        <path d="M9 3v18" />
        {/* Animated Chevron: smooth morph between left (collapse) and right (expand) + full cycle hover nudge */}
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            // Expand chevron (points right, expands sidebar)
            <motion.path
              key="expand"
              d="m14 9 3 3-3 3"
              initial={{ opacity: 0, x: -2 }}
              animate={controls}
              variants={{
                normal: { opacity: 1, x: 0 },
                animate: {
                  opacity: 1,
                  x: [0, 2.5, 0],
                  transition: { duration: 0.5, ease: 'easeInOut' },
                },
              }}
              exit={{ opacity: 0, x: 2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            />
          ) : (
            // Collapse chevron (points left, collapses sidebar)
            <motion.path
              key="collapse"
              d="m16 15-3-3 3-3"
              initial={{ opacity: 0, x: 2 }}
              animate={controls}
              variants={{
                normal: { opacity: 1, x: 0 },
                animate: {
                  opacity: 1,
                  x: [0, -2.5, 0],
                  transition: { duration: 0.5, ease: 'easeInOut' },
                },
              }}
              exit={{ opacity: 0, x: -2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
