'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, fadeIn, scaleIn } from './animations';

interface MotionWrapperProps extends HTMLMotionProps<'div'> {
  variant?: 'fadeUp' | 'fadeIn' | 'scaleIn';
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

const variantMap = { fadeUp, fadeIn, scaleIn };

export function MotionDiv({
  variant = 'fadeUp',
  delay = 0,
  className,
  children,
  ...props
}: MotionWrapperProps) {
  return (
    <motion.div variants={variantMap[variant]} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionSection({
  variant = 'fadeUp',
  className,
  children,
  ...props
}: MotionWrapperProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variantMap[variant]}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.section>
  );
}
