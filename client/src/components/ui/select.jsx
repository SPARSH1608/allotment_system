
import { useState } from "react"

export function Select({ children, value, onValueChange, defaultValue }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || "")

  const handleSelect = (newValue) => {
    setSelectedValue(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <SelectTrigger onClick={() => setIsOpen(!isOpen)} value={selectedValue}>
        {children}
      </SelectTrigger>
      {isOpen && <SelectContent onSelect={handleSelect}>{children}</SelectContent>}
    </div>
  )
}

export function SelectTrigger({ children, onClick, value, className = "" }) {
  const displayValue = value || "Select option"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    >
      <span className="block truncate">{displayValue}</span>
      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </button>
  )
}

export function SelectContent({ children, onSelect }) {
  return (
    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
      {children}
    </div>
  )
}

export function SelectItem({ value, children, onSelect }) {
  return (
    <div
      onClick={() => onSelect && onSelect(value)}
      className="cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white"
    >
      <span className="block truncate">{children}</span>
    </div>
  )
}

export function SelectValue({ placeholder = "Select..." }) {
  return <span>{placeholder}</span>
}
