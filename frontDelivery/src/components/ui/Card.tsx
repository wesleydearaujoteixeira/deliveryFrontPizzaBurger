import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : undefined}
      className={`rounded-2xl bg-surface-light p-4 shadow-card sm:p-5
        dark:bg-surface-dark-2 dark:shadow-card-dark ${className}`}
    >
      {children}
    </motion.div>
  );
}
