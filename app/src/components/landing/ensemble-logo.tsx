'use client';

interface EnsembleLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function EnsembleLogo({ className = 'h-8', variant = 'dark' }: EnsembleLogoProps) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-ensemble-900';
  return (
    <span className={`font-heading text-[1.2em] tracking-[0.15em] lowercase ${textColor} ${className}`}>
      ensemble
    </span>
  );
}

export function EnsembleLogoIcon({ className = 'h-4' }: { className?: string }) {
  return (
    <span className={`font-heading text-sm tracking-[0.15em] lowercase text-ensemble-900 ${className}`}>
      e
    </span>
  );
}
