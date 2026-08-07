import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary-foreground">
          <path d="M13 2L4.5 12.5h6.5L11 22l8.5-10.5H13L13 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
        </svg>
        <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md -z-10" />
      </div>
      {showText && (
        <span className="text-lg font-bold tracking-tight">
          Shrtul<span className="text-primary">X</span>
        </span>
      )}
    </Link>
  );
}
