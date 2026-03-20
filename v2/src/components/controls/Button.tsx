import type { ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  full = false,
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const classes = [
    styles.btn,
    styles[size],
    styles[variant],
    full ? styles.full : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  )
}
