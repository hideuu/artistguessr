import Icon from './Icon'

// The search box and its drop-down of matching artists.
export default function GuessInput({ query, setQuery, suggestions, onGuess }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-sm border-2 border-ink bg-bone px-3 focus-within:ring-2 focus-within:ring-close">
        <Icon name="search" className="text-ash" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && suggestions[0]) onGuess(suggestions[0])
          }}
          placeholder="Search for an artist"
          aria-label="Artist name"
          className="w-full bg-transparent py-3 text-lg outline-none placeholder:text-ash"
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-sm border border-hairline bg-bone shadow-lg">
          {suggestions.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => onGuess(a)}
                className="w-full px-4 py-2.5 text-left font-semibold hover:bg-parchment focus-visible:bg-parchment focus-visible:outline-none"
              >
                {a.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
