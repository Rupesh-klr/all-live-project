import { useState, useRef } from 'react'

/**
 * Tooltip — wraps any child element with a hover tooltip
 * Props: content (string|ReactNode), position (top|bottom|left|right), delay (ms)
 */
export function Tooltip({ children, content, position = 'top', delay = 200 }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const show = () => { timerRef.current = setTimeout(() => setVisible(true), delay) }
  const hide = () => { clearTimeout(timerRef.current); setVisible(false) }

  const posClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && content && (
        <span
          className={`absolute z-50 ${posClasses[position]}
            bg-dark-900 dark:bg-dark-950 text-white text-xs font-mono
            px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none
            animate-fade-in`}
        >
          {content}
        </span>
      )}
    </span>
  )
}
