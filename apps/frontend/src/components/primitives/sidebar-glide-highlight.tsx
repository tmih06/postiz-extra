'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Configuration properties for the `SidebarGlideHighlight` component.
 */
export interface SidebarGlideHighlightProps {
  /** React ref attached to the parent container whose children will be tracked. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** CSS selector identifying navigable item elements within the container. Defaults to `[data-sidebar-item]`. */
  itemSelector?: string;
  /** Optional additional CSS classes applied to the gliding motion container. */
  className?: string;
  /** Maximum pixel distance from cursor to candidate item edge for snapping to activate. Defaults to 52px. */
  snapThreshold?: number;
}

/**
 * Coordinate and dimension bounding box for positioning the highlight pill.
 */
interface BoxRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius?: string;
}

/**
 * Renders a physics-spring gliding background highlight that tracks cursor position
 * across sidebar items, snapping to the nearest valid target within a threshold.
 *
 * Features & Mechanics:
 * - Measures bounding boxes of child elements matching `itemSelector` relative to `containerRef`.
 * - Calculates Euclidean distance to nearest element boundary when not directly hovering.
 * - On initial entry, fades in from bottom without sliding; once active, slides smoothly via spring physics.
 * - Synchronizes position dynamically via `ResizeObserver` and scroll capture listeners.
 *
 * @param props - Configuration properties including container ref and snapping threshold.
 * @returns Animated highlight pill overlay element or hidden motion container.
 */
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
  /**
   * Identifies the target item element closest to the given viewport coordinates.
   *
   * Performs direct hit-testing first, then falls back to Euclidean distance snapping
   * against all visible candidate items matching `itemSelector` within `snapThreshold` (px).
   *
   * @param clientX - Viewport X coordinate of the cursor.
   * @param clientY - Viewport Y coordinate of the cursor.
   * @returns The matching HTMLElement if within snap distance, or `null`.
   */
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

  /**
   * Computes relative bounding coordinates and computed border radius of the target element
   * relative to `containerRef`, updating the active `targetBox` state.
   *
   * @param element - The DOM element to measure and highlight.
   */
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
