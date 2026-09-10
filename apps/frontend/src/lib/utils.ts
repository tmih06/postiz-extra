import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional CSS class names and resolves Tailwind CSS class conflicts.
 *
 * Combines `clsx` for flexible conditional class resolution (objects, arrays, strings, booleans)
 * with `tailwind-merge` (`twMerge`) to resolve conflicting utility classes by property precedence
 * (e.g. later specificity overrides earlier conflicting utility classes like `px-2` vs `px-4`).
 *
 * @param inputs - Variadic list of class values, objects, or arrays supported by clsx.
 * @returns A single de-duplicated and conflict-resolved className string.
 *
 * @example
 * cn('px-2 py-1 bg-red-500', isPrimary && 'bg-blue-500', 'px-4');
 * // -> 'py-1 bg-blue-500 px-4' (when isPrimary is true)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

