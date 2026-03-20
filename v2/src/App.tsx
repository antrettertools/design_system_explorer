import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useTemporalStore, useStore } from '@/store'
import { decodeShare } from '@/utils/share'

export function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporal = (useTemporalStore as (sel: (s: any) => any) => any)(s => s)

  useEffect(() => {
    // Restore from URL hash
    const hash = window.location.hash
    if (hash.startsWith('#v2/')) {
      decodeShare(hash).then(snapshot => {
        if (!snapshot) return
        const store = useStore.getState()
        if (snapshot.archetype) {
          store.personalityActions.setArchetype(snapshot.archetype)
        }
        if (snapshot.colors.length > 0) {
          store.colorActions.setPrimary(snapshot.colors[0])
          if (snapshot.colors[1]) store.colorActions.setSecondary(snapshot.colors[1])
          if (snapshot.colors.length > 2) store.colorActions.setAccents(snapshot.colors.slice(2))
        }
      })
    }

    // Keyboard shortcuts
    const handleKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        temporal.undo()
      } else if (mod && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        temporal.redo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [temporal])

  return <AppLayout />
}
