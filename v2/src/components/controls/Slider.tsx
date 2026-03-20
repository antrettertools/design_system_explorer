import styles from './Slider.module.css'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  displayValue?: string
  onChange: (value: number) => void
}

export function Slider({ label, value, min, max, step = 1, displayValue, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{displayValue ?? value}</span>
      </div>
      <input
        type="range"
        className={styles.input}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
