// Inline SVG icons for the PBD 2.0 homepage.
// Adapted from the exported Figma assets in /public/icons so they can be
// recolored via `currentColor`.

type IconProps = { size?: number; className?: string };

export function ChevronLeftIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShoppingBagIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" className={className}>
      <path
        d="M8.67 8.67H7.34c-1.41 0-2.11 0-2.61.29-.44.25-.78.65-.95 1.12-.2.54-.09 1.24.14 2.62l1.01 6.07c.17 1.03.26 1.54.51 1.93.23.34.55.61.92.78.42.19.94.19 1.99.19h9.29c1.04 0 1.56 0 1.99-.19.37-.17.69-.44.92-.78.25-.39.34-.9.51-1.93l1.01-6.07c.23-1.39.35-2.08.15-2.62a2.02 2.02 0 0 0-.95-1.12c-.5-.29-1.21-.29-2.61-.29h-1.32m-8.67 0h8.67m-8.67 0c0-2.39 1.94-4.33 4.33-4.33s4.33 1.94 4.33 4.33"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TruckIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M1 4h13v11H1zM14 8h4l3 3v4h-7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function HeadsetIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="2" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="18" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 19a4 4 0 0 1-4 4h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TagIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2 2 12l8 8 10-10V4a2 2 0 0 0-2-2h-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="16" cy="8" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function CardIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CloudUploadIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" fill="none" className={className}>
      <path
        d="M21 28V17.5M26.25 21L21 17.5l-5.25 3.5M40.25 26.25c0-3.87-3.13-7-7-7h-.12C32.28 13.31 27.17 8.75 21 8.75c-4.89 0-9.12 2.87-11.08 7.02C5.36 16.07 1.75 19.86 1.75 24.5c0 4.83 3.92 8.75 8.75 8.75l22.75 0c3.87 0 7-3.13 7-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
