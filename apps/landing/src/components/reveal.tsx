import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  as?: 'div' | 'section' | 'li' | 'span';
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  y?: number;
}

/** Simple in-view fade + rise wrapper used across sections. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  as = 'div',
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      transition={{ delay, duration: 0.8, ease: REVEAL_EASE }}
      viewport={{ margin: '-60px', once }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </MotionTag>
  );
}
