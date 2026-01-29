import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, Plus } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface ModernSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  searchable?: boolean
  creatable?: boolean
  disabled?: boolean
  icon?: React.ReactNode
}

export function ModernSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  className = '',
  searchable = false,
  creatable = false,
  disabled = false,
  icon
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value)
  
  const displayLabel = selectedOption ? selectedOption.label : (value && creatable ? value : placeholder)

  const filteredOptions = searchable
    ? options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  const showCreateOption = creatable && searchTerm && !filteredOptions.find(o => o.label.toLowerCase() === searchTerm.toLowerCase())

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex w-full items-center justify-between rounded-[var(--radius)] border bg-[color:var(--card-bg)] px-3 py-2 text-sm shadow-sm transition-all
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[color:var(--primary-bg)]/50'}
          ${isOpen ? 'border-[color:var(--primary-bg)] ring-1 ring-[color:var(--primary-bg)]' : 'border-[color:var(--border)]'}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-[color:var(--muted)]">{icon}</span>}
          {selectedOption?.icon && <span className="text-[color:var(--primary-bg)]">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption && !(creatable && value) ? 'text-[color:var(--muted)]' : 'text-[color:var(--text)] font-medium'}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-[color:var(--muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[color:var(--border)] bg-[color:var(--card-bg)] p-1 shadow-md animate-in fade-in zoom-in-95 slide-in-from-top-2">
          {(searchable || creatable) && (
            <div className="sticky top-0 mb-1 px-2 py-1.5 border-b border-[color:var(--border)] bg-[color:var(--card-bg)] z-10">
               <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--muted)]" />
                  <input
                    autoFocus
                    type="text"
                    className="w-full bg-transparent pl-7 pr-2 py-1 text-xs outline-none placeholder:text-[color:var(--muted)]"
                    placeholder="Buscar o crear..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
               </div>
            </div>
          )}
          
          <div className="py-0.5">
            {filteredOptions.length === 0 && !showCreateOption ? (
              <div className="px-2 py-4 text-center text-xs text-[color:var(--muted)]">
                No se encontraron resultados.
              </div>
            ) : (
              <>
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className={`
                    relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium outline-none select-none
                    ${value === option.value 
                      ? 'bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)]' 
                      : 'text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)]'
                    }
                  `}
                >
                  {option.icon && <span className={value === option.value ? 'text-[color:var(--primary-bg)]' : 'text-[color:var(--muted)]'}>{option.icon}</span>}
                  <span className="flex-1 truncate">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-3.5 w-3.5 text-[color:var(--primary-bg)]" />
                  )}
                </div>
              ))}
              
              {showCreateOption && (
                 <div
                    onClick={() => {
                       onChange(searchTerm)
                       setIsOpen(false)
                       setSearchTerm('')
                    }}
                    className="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium outline-none select-none text-[color:var(--primary-bg)] hover:bg-[color:var(--ghost-hover-bg)]"
                 >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="flex-1 truncate">Crear "{searchTerm}"</span>
                 </div>
              )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
