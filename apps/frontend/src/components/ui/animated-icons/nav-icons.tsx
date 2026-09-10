'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { AnimatedIconProps } from './types';
import { useIconLoop } from './use-icon-loop';

// 1. Composer: SquarePen icon with animated pen stroke
export function AnimatedSquarePen({
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
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <motion.path
          d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"
          animate={controls}
          variants={{
            normal: { rotate: 0, x: 0, y: 0 },
            animate: {
              rotate: [0, -4, 4, -2, 2, 0],
              x: [0, -1, 1.5, -0.5, 0],
              y: [0, 1.5, -1, 0.5, 0],
              transition: { duration: 0.65, ease: 'easeInOut' },
            },
          }}
        />
      </svg>
    </div>
  );
}

// 2. AI Studio: Sparkles with radiant rotating main star and blinking satellites
export function AnimatedSparkles({
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
          d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
          animate={controls}
          variants={{
            normal: { scale: 1, rotate: 0 },
            animate: {
              scale: [1, 1.14, 0.96, 1.05, 1],
              rotate: [0, 15, -12, 6, 0],
              transition: { duration: 0.8, ease: 'easeInOut' },
            },
          }}
          style={{ originX: '11px', originY: '11px' }}
        />
        <motion.path
          d="M20 3v4M22 5h-4"
          animate={controls}
          variants={{
            normal: { opacity: 1, scale: 1 },
            animate: {
              opacity: [1, 0.2, 1, 0.3, 1],
              scale: [1, 1.3, 0.9, 1.2, 1],
              transition: { duration: 0.8, delay: 0.08 },
            },
          }}
          style={{ originX: '20px', originY: '5px' }}
        />
        <motion.path
          d="M4 17v2M5 18H3"
          animate={controls}
          variants={{
            normal: { opacity: 1, scale: 1 },
            animate: {
              opacity: [1, 0.3, 1, 0.2, 1],
              scale: [1, 0.8, 1.25, 0.95, 1],
              transition: { duration: 0.8, delay: 0.16 },
            },
          }}
          style={{ originX: '4px', originY: '18px' }}
        />
      </svg>
    </div>
  );
}

// 3. Scheduled: Clock with fast-forward spinning hour and minute hands
export function AnimatedClock({
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
        <circle cx="12" cy="12" r="10" />
        <motion.line
          x1="12"
          y1="12"
          x2="12"
          y2="7"
          animate={controls}
          variants={{
            normal: { rotate: 0 },
            animate: {
              rotate: [0, 360],
              transition: { duration: 0.9, ease: [0.34, 1.3, 0.64, 1] },
            },
          }}
          style={{ originX: '12px', originY: '12px' }}
        />
        <motion.line
          x1="12"
          y1="12"
          x2="16"
          y2="12"
          animate={controls}
          variants={{
            normal: { rotate: 0 },
            animate: {
              rotate: [0, 720],
              transition: { duration: 0.9, ease: [0.34, 1.3, 0.64, 1] },
            },
          }}
          style={{ originX: '12px', originY: '12px' }}
        />
      </svg>
    </div>
  );
}

// 4. Calendar: CalendarDays with tactile bounce and staggered day-grid pulse
export function AnimatedCalendar({
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
        <path d="M8 2v4M16 2v4" />
        <motion.rect
          width="18"
          height="18"
          x="3"
          y="4"
          rx="2"
          animate={controls}
          variants={{
            normal: { y: 4 },
            animate: { y: [4, 2.5, 4], transition: { duration: 0.55, ease: 'easeOut' } },
          }}
        />
        <path d="M3 10h18" />
        {[
          { cx: '8', cy: '14', delay: 0.04, id: 'd1' },
          { cx: '12', cy: '14', delay: 0.1, id: 'd2' },
          { cx: '16', cy: '14', delay: 0.16, id: 'd3' },
          { cx: '8', cy: '18', delay: 0.12, id: 'd4' },
          { cx: '12', cy: '18', delay: 0.18, id: 'd5' },
          { cx: '16', cy: '18', delay: 0.24, id: 'd6' },
        ].map((dot) => (
          <motion.circle
            key={dot.id}
            cx={dot.cx}
            cy={dot.cy}
            r="1"
            animate={controls}
            variants={{
              normal: { scale: 1, opacity: 0.7 },
              animate: {
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
                transition: { duration: 0.45, delay: dot.delay },
              },
            }}
            style={{ originX: `${dot.cx}px`, originY: `${dot.cy}px` }}
          />
        ))}
      </svg>
    </div>
  );
}

// 5. Publications: ListFilter with cascading horizontal filter sliders
export function AnimatedListFilter({
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
          d="M2 5h20"
          animate={controls}
          variants={{
            normal: { x: 0 },
            animate: { x: [0, 2.5, -1.5, 0], transition: { duration: 0.55, ease: 'easeInOut' } },
          }}
        />
        <motion.path
          d="M6 12h12"
          animate={controls}
          variants={{
            normal: { x: 0 },
            animate: {
              x: [0, -2.5, 1.5, 0],
              transition: { duration: 0.55, delay: 0.08, ease: 'easeInOut' },
            },
          }}
        />
        <motion.path
          d="M9 19h6"
          animate={controls}
          variants={{
            normal: { x: 0 },
            animate: {
              x: [0, 2.5, -1.5, 0],
              transition: { duration: 0.55, delay: 0.16, ease: 'easeInOut' },
            },
          }}
        />
      </svg>
    </div>
  );
}

// 6. Drafts: FileText with animated typing/drawing lines
export function AnimatedFileText({
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
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <motion.path
          d="M10 9H8"
          animate={controls}
          variants={{
            normal: { x: 0, opacity: 1 },
            animate: { x: [0, 2, 0], opacity: [1, 0.35, 1], transition: { duration: 0.45, ease: 'easeInOut' } },
          }}
        />
        <motion.path
          d="M16 13H8"
          animate={controls}
          variants={{
            normal: { x: 0, opacity: 1 },
            animate: {
              x: [0, 2.5, 0],
              opacity: [1, 0.35, 1],
              transition: { duration: 0.45, delay: 0.08, ease: 'easeInOut' },
            },
          }}
        />
        <motion.path
          d="M16 17H8"
          animate={controls}
          variants={{
            normal: { x: 0, opacity: 1 },
            animate: {
              x: [0, 2.5, 0],
              opacity: [1, 0.35, 1],
              transition: { duration: 0.45, delay: 0.16, ease: 'easeInOut' },
            },
          }}
        />
      </svg>
    </div>
  );
}

// 7. Media Library: Image with floating sun and breathing landscape
export function AnimatedImage({
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
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <motion.circle
          cx="9"
          cy="9"
          r="2"
          animate={controls}
          variants={{
            normal: { y: 0, scale: 1 },
            animate: {
              y: [0, -2, 0],
              scale: [1, 1.2, 1],
              transition: { duration: 0.65, ease: 'easeInOut' },
            },
          }}
          style={{ originX: '9px', originY: '9px' }}
        />
        <motion.path
          d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
          animate={controls}
          variants={{
            normal: { y: 0 },
            animate: {
              y: [0, 1, -0.5, 0],
              transition: { duration: 0.65, delay: 0.05, ease: 'easeInOut' },
            },
          }}
        />
      </svg>
    </div>
  );
}

// 8. Analytics: BarChart3 with ascending staggered column growth
export function AnimatedBarChart({
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
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <motion.path
          d="M7 16v-4"
          animate={controls}
          variants={{
            normal: { scaleY: 1 },
            animate: {
              scaleY: [1, 1.45, 0.9, 1],
              transition: { duration: 0.55, ease: 'easeInOut' },
            },
          }}
          style={{ originY: '16px' }}
        />
        <motion.path
          d="M12 16V9"
          animate={controls}
          variants={{
            normal: { scaleY: 1 },
            animate: {
              scaleY: [1, 1.35, 0.92, 1],
              transition: { duration: 0.55, delay: 0.08, ease: 'easeInOut' },
            },
          }}
          style={{ originY: '16px' }}
        />
        <motion.path
          d="M17 16v-7"
          animate={controls}
          variants={{
            normal: { scaleY: 1 },
            animate: {
              scaleY: [1, 1.4, 0.9, 1],
              transition: { duration: 0.55, delay: 0.16, ease: 'easeInOut' },
            },
          }}
          style={{ originY: '16px' }}
        />
      </svg>
    </div>
  );
}

// 9. Social Channels: Share2 with pulsing nodes and connecting line tension
export function AnimatedShare({
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
        <motion.circle
          cx="18"
          cy="5"
          r="3"
          animate={controls}
          variants={{
            normal: { scale: 1 },
            animate: {
              scale: [1, 1.28, 1],
              transition: { duration: 0.55, delay: 0.08, ease: 'easeInOut' },
            },
          }}
          style={{ originX: '18px', originY: '5px' }}
        />
        <motion.circle
          cx="6"
          cy="12"
          r="3"
          animate={controls}
          variants={{
            normal: { scale: 1 },
            animate: {
              scale: [1, 1.3, 1],
              transition: { duration: 0.55, ease: 'easeInOut' },
            },
          }}
          style={{ originX: '6px', originY: '12px' }}
        />
        <motion.circle
          cx="18"
          cy="19"
          r="3"
          animate={controls}
          variants={{
            normal: { scale: 1 },
            animate: {
              scale: [1, 1.28, 1],
              transition: { duration: 0.55, delay: 0.12, ease: 'easeInOut' },
            },
          }}
          style={{ originX: '18px', originY: '19px' }}
        />
        <motion.line
          x1="8.59"
          y1="13.51"
          x2="15.42"
          y2="17.49"
          animate={controls}
          variants={{
            normal: { opacity: 1 },
            animate: { opacity: [1, 0.35, 1], transition: { duration: 0.55, ease: 'easeInOut' } },
          }}
        />
        <motion.line
          x1="15.41"
          y1="6.51"
          x2="8.59"
          y2="10.49"
          animate={controls}
          variants={{
            normal: { opacity: 1 },
            animate: { opacity: [1, 0.35, 1], transition: { duration: 0.55, ease: 'easeInOut' } },
          }}
        />
      </svg>
    </div>
  );
}

// 10. Integrations: Puzzle with tactile snap-and-wiggle
export function AnimatedPuzzle({
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
          d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"
          animate={controls}
          variants={{
            normal: { rotate: 0, scale: 1 },
            animate: {
              rotate: [0, -9, 9, -5, 5, 0],
              scale: [1, 1.08, 0.98, 1],
              transition: { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] },
            },
          }}
          style={{ originX: '12px', originY: '12px' }}
        />
      </svg>
    </div>
  );
}

// 11. Settings: Gear with tactile smooth precision spin
export function AnimatedSettings({
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
            transition: { duration: 0.5, ease: [0.34, 1.4, 0.64, 1] },
          },
        }}
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </motion.svg>
    </div>
  );
}
