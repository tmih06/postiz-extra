'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { AnimatedIconProps } from './types';
import { useIconLoop } from './use-icon-loop';

// 1. Search: Magnifying glass with searching translate & angle sweep
export function AnimatedSearch({
  size,
  className,
  isHovered: externalHovered,
  onMouseEnter,
  onMouseLeave,
  ...props
}: AnimatedIconProps) {
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
          normal: { x: 0, y: 0, rotate: 0 },
          animate: {
            x: [0, -1.5, 1.5, -0.5, 0],
            y: [0, -1.5, 1.5, -0.5, 0],
            rotate: [0, -6, 6, 0],
            transition: { duration: 0.55, ease: 'easeInOut' },
          },
        }}
        style={{ originX: '11px', originY: '11px' }}
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </motion.svg>
    </div>
  );
}

// 2. Clear/Close: X with crisp 90deg spring rotation
export function AnimatedX({
  size,
  className,
  isHovered: externalHovered,
  onMouseEnter,
  onMouseLeave,
  ...props
}: AnimatedIconProps) {
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
          normal: { rotate: 0, scale: 1 },
          animate: {
            rotate: [0, 90],
            scale: [1, 1.15, 1],
            transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
          },
        }}
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </motion.svg>
    </div>
  );
}

// 3. ChevronDown: Smooth downward nudge
export function AnimatedChevronDown({
  size,
  className,
  isHovered: externalHovered,
  onMouseEnter,
  onMouseLeave,
  ...props
}: AnimatedIconProps) {
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
        <motion.path
          d="m6 9 6 6 6-6"
          animate={controls}
          variants={{
            normal: { y: 0 },
            animate: { y: [0, 2.5, 0], transition: { duration: 0.4, ease: 'easeOut' } },
          }}
        />
      </svg>
    </div>
  );
}

// 4. Check: Pop scale checkmark
export function AnimatedCheck({
  size,
  className,
  isHovered: externalHovered,
  onMouseEnter,
  onMouseLeave,
  ...props
}: AnimatedIconProps) {
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
        <motion.path
          d="M20 6 9 17l-5-5"
          animate={controls}
          variants={{
            normal: { scale: 1 },
            animate: {
              scale: [1, 1.25, 0.95, 1],
              transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
            },
          }}
          style={{ originX: '12px', originY: '12px' }}
        />
      </svg>
    </div>
  );
}

// 5. Plus: 90-degree spring spin
export function AnimatedPlus({
  size,
  className,
  isHovered: externalHovered,
  onMouseEnter,
  onMouseLeave,
  ...props
}: AnimatedIconProps) {
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
            rotate: [0, 90],
            transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
          },
        }}
      >
        <path d="M5 12h14M12 5v14" />
      </motion.svg>
    </div>
  );
}

// 6. Sign Out: Arrow sliding right out of doorway
export function AnimatedLogOut({
  size,
  className,
  isHovered: externalHovered,
  onMouseEnter,
  onMouseLeave,
  ...props
}: AnimatedIconProps) {
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
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <motion.g
          animate={controls}
          variants={{
            normal: { x: 0 },
            animate: {
              x: [0, 3.5, 0],
              transition: { duration: 0.5, ease: 'easeInOut' },
            },
          }}
        >
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </motion.g>
      </svg>
    </div>
  );
}
