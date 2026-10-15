import { useEffect } from 'react'
import Icon from './Icon'

// A centered pop-up. Closes with the ✕ button, the Esc key, or a click outside.
export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 px-4 py-10 sm:items-center"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-lg bg-bone p-6 shadow-2xl sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-parchment"
        >
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  )
}
