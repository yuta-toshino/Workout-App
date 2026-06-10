interface Props {
  name: IconName
  size?: number
  className?: string
  filled?: boolean
}

export type IconName =
  | 'today'
  | 'progress'
  | 'plan'
  | 'settings'
  | 'close'
  | 'check'
  | 'plus'
  | 'chevron'
  | 'chevron-left'
  | 'play'
  | 'timer'
  | 'sync'
  | 'flame'
  | 'golf'
  | 'dumbbell'
  | 'camera'
  | 'edit'
  | 'bolt'
  | 'moon'
  | 'cloud'

const PATHS: Record<IconName, string> = {
  today:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  progress: 'M3 3v18h18M7 15l4-5 3 3 5-7',
  plan: 'M9 4h6a1 1 0 0 1 1 1v0H8v0a1 1 0 0 1 1-1ZM8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12h6M9 16h6',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  chevron: 'm9 18 6-6-6-6',
  'chevron-left': 'm15 18-6-6 6-6',
  play: 'M6 4l14 8-14 8V4Z',
  timer: 'M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 10v4M9 2h6',
  sync: 'M21 12a9 9 0 0 1-9 9 9 9 0 0 1-7.5-4M3 12a9 9 0 0 1 9-9 9 9 0 0 1 7.5 4M3 17v-4h4M21 7v4h-4',
  flame:
    'M12 22c4 0 7-2.5 7-6.5 0-2.5-1.5-4-2.5-5.5-.5 1.5-1.5 2-2.5 2 0-2 .5-4.5-2-7-.5 2.5-2 3.5-3.5 5.5C7 12 5 13.5 5 15.5 5 19.5 8 22 12 22Z',
  golf: 'M12 2v15M12 4l6 2.5L12 9M12 21c-3 0-5 .8-5 1.5M12 21c3 0 5 .8 5 1.5M10 21.2a2 2 0 1 0 4 0',
  dumbbell: 'M6.5 6.5 17.5 17.5M3 8v8M8 3l13 13M6 5v0M5 6 3 8M16 21l5-5M21 16v-8M19 19l2-2',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z',
  bolt: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  cloud: 'M18 10h-1.3A5 5 0 1 0 7 12a4 4 0 0 0-3 4 4 4 0 0 0 4 4h10a3.5 3.5 0 0 0 0-7Z',
}

const FILLED = new Set<IconName>(['play', 'flame', 'bolt'])

export function Icon({ name, size = 22, className, filled }: Props) {
  const useFill = filled ?? FILLED.has(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={useFill ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={useFill ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
