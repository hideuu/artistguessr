import Icon, { Logo } from './Icon'

function NavButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold hover:bg-parchment focus-visible:outline-2 focus-visible:outline-ink"
    >
      <Icon name={icon} />
      {/* Labels show on wider screens; phones get icons only. */}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export default function Header({ onHome, onHelp, onArchive, onStats }) {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <button onClick={onHome} className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="font-display text-2xl font-black tracking-tight">
            ArtistGuessr
          </span>
        </button>
        <nav className="flex items-center">
          <NavButton icon="help" label="How to play" onClick={onHelp} />
          <NavButton icon="archive" label="Archive" onClick={onArchive} />
          <NavButton icon="stats" label="Stats" onClick={onStats} />
        </nav>
      </div>
    </header>
  )
}
