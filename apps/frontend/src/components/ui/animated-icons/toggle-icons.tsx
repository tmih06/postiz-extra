'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { AnimatedIconProps } from './types';
import { useIconLoop } from './use-icon-loop';

export interface AnimatedThemeToggleProps extends Omit<AnimatedIconProps, 'children'> {
  isDark: boolean;
}

// Multi-variant Theme Toggle: Smooth morph between Sun and Moon on toggle + repeating micro-hover
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

export interface AnimatedCollapseToggleProps extends Omit<AnimatedIconProps, 'children'> {
  collapsed: boolean;
}

// Multi-variant Collapse Toggle: smooth morph between left (collapse) and right (expand) + repeating micro-hover
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
