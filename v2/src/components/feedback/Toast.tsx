import { useToast } from '@/hooks/useToast'
import styles from './Toast.module.css'

export function Toast() {
  const { toastMessage } = useToast()

  return (
    <div
      className={`${styles.toast} ${toastMessage ? styles.visible : styles.hidden}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {toastMessage}
    </div>
  )
}
