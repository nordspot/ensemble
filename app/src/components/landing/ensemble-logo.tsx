'use client';

interface EnsembleLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function EnsembleLogo({ className = 'h-8', variant = 'dark' }: EnsembleLogoProps) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-ensemble-900';
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Rosette mark */}
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-auto shrink-0" aria-hidden="true">
        <circle cx="14" cy="20" r="7.5" stroke="#E8593C" strokeWidth="1.2" fill="none" opacity="0.9" />
        <circle cx="20" cy="10" r="7.5" stroke="#E8593C" strokeWidth="1.2" fill="none" opacity="0.6" />
        <circle cx="26" cy="20" r="7.5" stroke="#E8593C" strokeWidth="1.2" fill="none" opacity="0.7" />
        <circle cx="20" cy="30" r="7.5" stroke="#E8593C" strokeWidth="1.2" fill="none" opacity="0.5" />
        <circle cx="20" cy="20" r="2.5" fill="#E8593C" />
      </svg>
      <span className={`font-body text-[1.1em] font-medium tracking-[0.2em] uppercase ${textColor}`}>
        ensemble
      </span>
    </div>
  );
}

export function EnsembleLogoIcon({ className = 'h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={`${className} w-auto`} aria-label="Ensemble">
      <circle cx="14" cy="20" r="7.5" stroke="#E8593C" strokeWidth="1.2" fill="none" opacity="0.9" />
      <circle cx="20" cy="10" r="7.5" stroke="#E8593C" strokeWidth="1.2" fill="none" opacity="0.6" />
      <circle cx="26" cy="20" r="7.5" stroke="#E8593C" strokeWidth="1.2" fill="none" opacity="0.7" />
      <circle cx="20" cy="30" r="7.5" stroke="#E8593C" strokeWidth="1.2" fill="none" opacity="0.5" />
      <circle cx="20" cy="20" r="2.5" fill="#E8593C" />
    </svg>
  );
}
