import styles from './RadioGroup.module.css'

interface Option<T extends string> {
  label: string
  value: T
}

interface RadioGroupProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  columns?: number
}

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  columns,
}: RadioGroupProps<T>) {
  const gridStyle = columns
    ? ({ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` } as React.CSSProperties)
    : undefined

  return (
    <div className={styles.group} style={gridStyle}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`${styles.btn}${value === opt.value ? ` ${styles.active}` : ''}`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
