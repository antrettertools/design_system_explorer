import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/globals.css'

// Apply persisted theme immediately to avoid flash
const stored = localStorage.getItem('typeset-v1')
if (stored) {
  try {
    const parsed = JSON.parse(stored) as { ui?: { theme?: string } }
    const theme = parsed?.ui?.theme
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  } catch {
    // ignore
  }
}

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
