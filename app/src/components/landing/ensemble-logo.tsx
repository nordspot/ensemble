'use client';

/* eslint-disable @next/next/no-img-element */

interface EnsembleLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function EnsembleLogo({ className = 'h-8', variant = 'light' }: EnsembleLogoProps) {
  const src = variant === 'dark' ? '/images/ensemble-logo-white.svg' : '/images/ensemble-logo-black.svg';
  return (
    <img
      src={src}
      alt="ensemble"
      className={`${className} w-auto`}
      style={{ display: 'block' }}
    />
  );
}

export function EnsembleLogoIcon({ className = 'h-4' }: { className?: string }) {
  return (
    <img
      src="/images/ensemble-logo-black.svg"
      alt="e"
      className={`${className} w-auto`}
      style={{ display: 'inline-block' }}
    />
  );
}
