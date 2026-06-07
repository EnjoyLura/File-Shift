import { cn } from '@/lib/utils';

interface WaveDividerProps {
  className?: string;
  flip?: boolean;
}

export function WaveDivider({ className, flip = false }: WaveDividerProps) {
  return (
    <div
      className={cn('absolute left-0 right-0', flip ? 'top-0 rotate-180' : 'bottom-0', className)}
    >
      <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none">
        <path
          d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 40C1200 38 1320 28 1380 23L1440 18V60H0Z"
          className="fill-background"
        />
      </svg>
    </div>
  );
}
