import { useEffect } from 'react'
import { useUI, useUIActions } from '@/store'

export function useToast() {
  const { toastMessage } = useUI()
  const { showToast, clearToast } = useUIActions()

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(clearToast, 2400)
    return () => clearTimeout(timer)
  }, [toastMessage, clearToast])

  return { toastMessage, showToast }
}
