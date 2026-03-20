import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useTemporalStore } from '@/store'

export function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporal = (useTemporalStore as (sel: (s: any) => any) => any)(s => s)

  useEffect(() => {
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
