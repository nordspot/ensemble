'use client';

interface EnsembleLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function EnsembleLogo({ className = 'h-8', variant = 'dark' }: EnsembleLogoProps) {
  const textColor = variant === 'dark' ? '#FFFFFF' : '#0A0F1E';
  const accentColor = '#E8593C';

  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ensemble"
    >
      {/* Geometric mark: overlapping circles forming a rosette */}
      <circle cx="16" cy="20" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.8" />
      <circle cx="22.5" cy="8.7" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="22.5" cy="31.3" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="29" cy="20" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Center dot */}
      <circle cx="22.5" cy="20" r="2" fill={accentColor} />

      {/* Wordmark */}
      <text
        x="44"
        y="26"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="18"
        fontWeight="500"
        letterSpacing="3"
        fill={textColor}
      >
        ensemble
      </text>
    </svg>
  );
}

export function EnsembleLogoIcon({ className = 'h-8' }: { className?: string }) {
  const accentColor = '#E8593C';

  return (
    <svg
      viewBox="0 0 45 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ensemble"
    >
      <circle cx="16" cy="20" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.8" />
      <circle cx="22.5" cy="8.7" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="22.5" cy="31.3" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="29" cy="20" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="22.5" cy="20" r="2" fill={accentColor} />
    </svg>
  );
}
