import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { saveSnapshot } from '../../utils/sessionSnapshot'

const POSITIONS_KEY = 'scroll_positions'

function getPositions() {
  try { return JSON.parse(sessionStorage.getItem(POSITIONS_KEY) || '{}') }
  catch { return {} }
}

function setPosition(pathname, y) {
  try {
    const positions = getPositions()
    positions[pathname] = y
    sessionStorage.setItem(POSITIONS_KEY, JSON.stringify(positions))
  } catch {}
}

/**
 * Placed inside BrowserRouter in App.jsx.
 * - Saves scroll position for each route when navigating away.
 * - Restores scroll on navigation (tab-session only — uses sessionStorage).
 * - Also saves to localStorage session_snapshot (auth recovery — persists 24h).
 */
export function ScrollRestorer() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  useLayoutEffect(() => {
    // Restore scroll for the incoming route
    const positions = getPositions()
    const savedY = positions[location.pathname]
    window.scrollTo({ top: savedY ?? 0, behavior: 'instant' })

    // On unmount (navigating away): save current scroll for this route
    return () => {
      setPosition(location.pathname, window.scrollY)
    }
  }, [location.pathname])

  // Persist to localStorage (auth snapshot) while authenticated
  // Saves on scroll (debounced 1s) + on visibility change + on beforeunload
  useLayoutEffect(() => {
    if (!isAuthenticated) return

    let debounce
    function persist() {
      clearTimeout(debounce)
      debounce = setTimeout(() => {
        saveSnapshot(location.pathname, window.scrollY)
        setPosition(location.pathname, window.scrollY)
      }, 1000)
    }

    function persistNow() {
      saveSnapshot(location.pathname, window.scrollY)
      setPosition(location.pathname, window.scrollY)
    }

    window.addEventListener('scroll', persist, { passive: true })
    document.addEventListener('visibilitychange', persistNow)
    window.addEventListener('beforeunload', persistNow)

    return () => {
      clearTimeout(debounce)
      persistNow()
      window.removeEventListener('scroll', persist)
      document.removeEventListener('visibilitychange', persistNow)
      window.removeEventListener('beforeunload', persistNow)
    }
  }, [location.pathname, isAuthenticated])

  return null
}
