import Countdown from './Countdown'
import Modal from './Modal'
import StatsPanel from './StatsPanel'

// Opens when the game ends, or from the Stats button in the header.
// `result` is null while today's game is still going: then it only shows stats.
export default function ResultsModal({ result, stats, isArchive, copied, onShare, onArchive, onClose }) {
  return (
    <Modal title="Statistics" onClose={onClose}>
      {result && (
        <div className="mb-6 text-center">
          <h2 className="font-display text-4xl font-black">
            {result.won ? 'Congratulations!' : 'So close.'}
          </h2>
          <p className="mt-2">
            It was <b>{result.answer}</b>.{' '}
            {result.won
              ? `You got it in ${result.count}.`
              : 'Better luck tomorrow.'}
          </p>
        </div>
      )}

      {isArchive ? (
        <p className="text-center text-sm text-ash">Archive games don't change your stats.</p>
      ) : (
        <StatsPanel stats={stats} highlight={result?.won ? result.count : null} />
      )}

      {result && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onShare}
            className="flex-1 rounded-full bg-crimson px-5 py-3 font-semibold text-bone hover:brightness-110"
          >
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={onArchive}
            className="flex-1 rounded-full border-2 border-ink px-5 py-3 font-semibold hover:bg-parchment"
          >
            Play the archive
          </button>
        </div>
      )}

      {!isArchive && (
        <div className="mt-5 border-t border-hairline pt-4 text-center">
          <Countdown />
        </div>
      )}
    </Modal>
  )
}
