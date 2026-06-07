import { cn } from '@/lib/utils';

interface GradientOrbProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  delay?: number;
}

const sizeMap = {
  sm: 'w-40 h-40',
  md: 'w-60 h-60',
  lg: 'w-80 h-80',
};

export function GradientOrb({
  className,
  size = 'md',
  color = 'bg-blue-400/20',
  delay = 0,
}: GradientOrbProps) {
  return (
    <div
      className={cn(
        'absolute rounded-full blur-3xl pointer-events-none',
        sizeMap[size],
        color,
        className,
      )}
      style={{ animation: `float ${6 + delay}s ease-in-out infinite ${delay}s` }}
    />
  );
}
