import { useEffect, useRef, useState } from 'react'
import styles from './select.module.css'

export type SelectOption = {
  label: string
  value: string | number
}

type SingleSelectProps = {
  multiple?: false
  value?: SelectOption
  onChange: (value: SelectOption | undefined) => void
}

type MultipleSelectProps = {
  multiple: true
  value: SelectOption[]
  onChange: (value: SelectOption[]) => void
}

type SelectProps = {
  options: SelectOption[]
} & (SingleSelectProps | MultipleSelectProps)

export const Select = ({ multiple, value, onChange, options }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  function clearOptions() {
    multiple ? onChange([]) : onChange(undefined)
  }

  function selectOption(option: SelectOption) {
    // multiple select
    if (multiple) {
      // remove if already in selected
      if (value.includes(option)) {
        onChange(value.filter(o => o !== option))
      } else {
        // add new option to selected
        onChange([...value, option])
      }
      // single select
    } else {
      if (option !== value) onChange(option)
    }
  }

  function isOptionSelected(option: SelectOption) {
    return multiple ? value.includes(option) : option === value
  }

  useEffect(() => {
    if (isOpen) setHighlightedIndex(0)
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target != containerRef.current) return
      switch (e.code) {
        case 'Enter':
        case 'Space':
          setIsOpen(prev => !prev)
          if (isOpen) selectOption(options[highlightedIndex])
          break
        case 'ArrowUp':
        case 'ArrowDown': {
          if (!isOpen) setIsOpen(true)
          const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1)
          if (newValue >= 0 && newValue < options.length) {
            setHighlightedIndex(newValue)
          }
          break
        }
        case 'Escape':
          setIsOpen(false)
      }
    }
    containerRef.current?.addEventListener('keydown', handler)
    return () => {
      containerRef.current?.removeEventListener('keydown', handler)
    }
  }, [isOpen, highlightedIndex, options])

  return (
    <div ref={containerRef} onClick={() => setIsOpen(prev => !prev)} onBlur={() => setIsOpen(false)} tabIndex={0} className={styles.container}>
      <span className={styles.value}>{multiple ? value.map(v => (<button key={v.value} onClick={e => { e.stopPropagation(), selectOption(v) }} className={styles['option-badge']}>{v.label}<span className={styles['remove-btn']}>&times;</span></button>)) : value?.label}</span>
      <button onClick={e => { e.stopPropagation(), clearOptions() }} className={styles['clear-btn']}>&times;</button>
      <div className={styles.divaider}></div>
      <div className={styles.caret}></div>
      <ul className={`${styles.options} ${isOpen && styles.show}`}>
        {options.map((option, index) => (
          <li
            onClick={e => { e.stopPropagation(), selectOption(option), setIsOpen(false) }}
            className={`${styles.option} ${index === highlightedIndex && styles.highlighted} ${isOptionSelected(option) && styles.selected} `}
            onMouseEnter={() => setHighlightedIndex(index)}
            key={option.value}
          >{option.label}</li>
        ))}
      </ul>
    </div>
  )
}
