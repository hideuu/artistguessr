// Small line icons, drawn on a 24x24 grid. Add new ones to PATHS.
const PATHS = {
  country: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z',
  genres: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  debut_year: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  artist_type: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  group_size: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2 15a6 6 0 0 0-3-5',
  gender: 'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 0v7m-3-3h6',
  listener_tier: 'M4 20v-6M9 20V9M14 20v-9M19 20V4',
  album_count: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  status: 'M3 12h4l3-8 4 16 3-8h4',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2.5-11.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14m0 3h.01',
  archive: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h3',
  stats: 'M4 20h16M7 16V10M12 16V5M17 16v-4',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5 10 17 19 7',
  lock: 'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
}

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

// The record logo: a crimson square with a vinyl disc.
export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="var(--color-crimson)" />
      <circle cx="16" cy="16" r="11" fill="var(--color-ink)" />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="#3a2a2a" />
      <circle cx="16" cy="16" r="4" fill="var(--color-bone)" />
      <circle cx="16" cy="16" r="1.2" fill="var(--color-ink)" />
    </svg>
  )
}
