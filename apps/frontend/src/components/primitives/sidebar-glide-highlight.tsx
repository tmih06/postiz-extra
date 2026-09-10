'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface SidebarGlideHighlightProps {
  containerRef: React.RefObject<HTMLElement | null>;
  itemSelector?: string;
  className?: string;
  snapThreshold?: number;
}

interface BoxRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius?: string;
}

export function SidebarGlideHighlight({
  containerRef,
  itemSelector = '[data-sidebar-item]',
  className = '',
  snapThreshold = 52,
}: SidebarGlideHighlightProps) {
  const [targetBox, setTargetBox] = useState<BoxRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isFirstEntry, setIsFirstEntry] = useState(true);

  const visibleRef = useRef(false);
  const currentTargetRef = useRef<HTMLElement | null>(null);
  const firstEntryTimeoutRef = useRef<number | null>(null);
  // Computes the nearest sidebar section to the cursor coordinates
  const getTargetElement = useCallback(
    (clientX: number, clientY: number): HTMLElement | null => {
      const container = containerRef.current;
      if (!container) return null;

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(itemSelector)
      ).filter((el) => {
        // Exclude hidden elements (e.g. display: none in collapsed mode)
        return el.offsetParent !== null || el.getBoundingClientRect().height > 0;
      });

      if (items.length === 0) return null;

      // 1. Direct hit check (cursor is directly over an item)
      for (const item of items) {
        const r = item.getBoundingClientRect();
        if (
          clientX >= r.left &&
          clientX <= r.right &&
          clientY >= r.top &&
          clientY <= r.bottom
        ) {
          return item;
        }
      }

      // 2. Snap to nearest section within threshold
      let closest: HTMLElement | null = null;
      let minDistance = Infinity;

      for (const item of items) {
        const r = item.getBoundingClientRect();
        const dx = Math.max(r.left - clientX, 0, clientX - r.right);
        const dy = Math.max(r.top - clientY, 0, clientY - r.bottom);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          closest = item;
        }
      }

      if (minDistance <= snapThreshold) {
        return closest;
      }

      return null;
    },
    [containerRef, itemSelector, snapThreshold]
  );

  // Updates box dimensions relative to the container
  const updateBoxForElement = useCallback(
    (element: HTMLElement) => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = element.getBoundingClientRect();

      const computedStyle = window.getComputedStyle(element);
      const borderRadius = computedStyle.borderRadius || '8px';

      setTargetBox({
        top: targetRect.top - containerRect.top,
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius,
      });
    },
    [containerRef]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = getTargetElement(e.clientX, e.clientY);

      if (target) {
        currentTargetRef.current = target;
        updateBoxForElement(target);

        if (!visibleRef.current) {
          // Entry: start bottom-up fade-in
          visibleRef.current = true;
          setIsVisible(true);
          setIsFirstEntry(true);

          if (firstEntryTimeoutRef.current !== null) {
            window.clearTimeout(firstEntryTimeoutRef.current);
          }
          firstEntryTimeoutRef.current = window.setTimeout(() => {
            setIsFirstEntry(false);
          }, 60);
        }
      } else {
        // Cursor is too far from any section inside container
        if (visibleRef.current) {
          visibleRef.current = false;
          setIsVisible(false);
          setIsFirstEntry(true);
          currentTargetRef.current = null;
        }
      }
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
      setIsFirstEntry(true);
      currentTargetRef.current = null;
      if (firstEntryTimeoutRef.current !== null) {
        window.clearTimeout(firstEntryTimeoutRef.current);
        firstEntryTimeoutRef.current = null;
      }
    };

    // Re-sync box position when content scrolls inside container
    const handleScroll = () => {
      if (visibleRef.current && currentTargetRef.current) {
        updateBoxForElement(currentTargetRef.current);
      }
    };

    // Re-sync box position when container or window changes dimensions
    const resizeObserver = new ResizeObserver(() => {
      if (visibleRef.current && currentTargetRef.current) {
        updateBoxForElement(currentTargetRef.current);
      }
    });

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('scroll', handleScroll, { capture: true });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('scroll', handleScroll, { capture: true });
      resizeObserver.disconnect();
      if (firstEntryTimeoutRef.current !== null) {
        window.clearTimeout(firstEntryTimeoutRef.current);
        firstEntryTimeoutRef.current = null;
      }
    };
  }, [containerRef, getTargetElement, updateBoxForElement]);

  return (
    <motion.div
      aria-hidden
      className={cn(
        'pointer-events-none absolute z-0 rounded-[7px] border shadow-sm',
        className
      )}
      style={{
        backgroundColor: 'var(--hover)',
        borderColor: 'var(--line-soft)',
        borderRadius: targetBox?.borderRadius || '7px',
      }}
      initial={false}
      animate={{
        top: targetBox?.top ?? 0,
        left: targetBox?.left ?? 0,
        width: targetBox?.width ?? 0,
        height: targetBox?.height ?? 0,
        opacity: isVisible && targetBox ? 1 : 0,
        y: isVisible && targetBox ? 0 : 8,
        scale: isVisible && targetBox ? 1 : 0.95,
      }}
      transition={{
        // Smooth slide between sections when already inside
        top: isFirstEntry ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 28, mass: 0.7 },
        left: isFirstEntry ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 28, mass: 0.7 },
        width: isFirstEntry ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 28, mass: 0.7 },
        height: isFirstEntry ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 28, mass: 0.7 },
        // Smooth bottom-up fade-in on entry, fade-out on exit
        opacity: { duration: 0.2, ease: 'easeOut' },
        y: { type: 'spring', stiffness: 340, damping: 24 },
        scale: { type: 'spring', stiffness: 340, damping: 24 },
      }}
    />
  );
}

export default SidebarGlideHighlight;
