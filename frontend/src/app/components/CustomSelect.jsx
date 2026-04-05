'use client'

import { Children, isValidElement, useEffect, useRef, useState } from 'react'

export default function CustomSelect({
  id,
  label,
  value,
  onChange,
  theme,
  children,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const containerRef = useRef(null)
  const triggerRef = useRef(null)

  // Flatten children so mapped option arrays are included.
  const allOptions = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === 'option'
  )
  const clusterOptions = allOptions.filter(
    (opt) => String(opt?.props?.value ?? '') !== ''
  )
  const options = clusterOptions.length ? clusterOptions : allOptions

  useEffect(() => {
    const selected = allOptions.find(
      (opt) => String(opt?.props?.value ?? '') === String(value ?? '')
    )
    setSelectedLabel(selected?.props?.children || 'No custom cluster')
  }, [value, allOptions])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } })
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider ml-1"
          style={{ color: theme.muted }}
        >
          {label}
        </label>
      ) : null}

      <div className="relative" ref={containerRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3.5 pr-10 rounded-lg text-sm transition-all duration-200 font-medium text-left flex items-center justify-between"
          style={{
            backgroundColor: theme.inputBg,
            color: theme.foreground,
            border: `1.5px solid ${isOpen ? theme.accent : theme.lowBorder}`,
            boxShadow: isOpen ? `0 0 0 3px ${theme.accent}22` : 'none',
          }}
        >
          <span>{selectedLabel}</span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: theme.muted }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg overflow-hidden z-50"
            style={{
              backgroundColor: theme.panelOuter,
              borderColor: theme.lowBorder,
              boxShadow: `0 12px 32px ${theme.shadow}`,
            }}
          >
            <div className="max-h-64 overflow-y-auto">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <button
                    key={option?.props?.value || index}
                    type="button"
                    onClick={() => handleSelect(option?.props?.value)}
                    className="w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-150 hover:bg-opacity-100"
                    style={{
                      backgroundColor: value === option?.props?.value ? theme.accent : 'transparent',
                      color: value === option?.props?.value ? '#00354a' : theme.foreground,
                    }}
                    onMouseEnter={(e) => {
                      if (value !== option?.props?.value) {
                        e.target.style.backgroundColor = `${theme.accent}22`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (value !== option?.props?.value) {
                        e.target.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {option?.props?.children}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm" style={{ color: theme.muted }}>
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
