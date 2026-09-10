import type { HTMLAttributes } from 'react';

export interface AnimatedIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  className?: string;
  isHovered?: boolean;
}
