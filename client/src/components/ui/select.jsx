"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Check } from "lucide-react"

export function Select({ children, value, onValueChange, placeholder = "Select option" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)

  // Update internal state when props change
  useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle selection
  const handleSelect = (newValue, displayText) => {
    setSelectedValue(newValue)
    setIsOpen(false)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  // Get display text from children
  const getDisplayText = () => {
    let displayText = placeholder

    if (selectedValue) {
      // Find the matching SelectItem to get its display text
      const findDisplayText = (children) => {
        let result = selectedValue

        if (Array.isArray(children)) {
          children.forEach((child) => {
            if (child && child.props && child.props.value === selectedValue) {
              result =
                typeof child.props.children === "string"
                  ? child.props.children
                  : child.props.displayText || selectedValue
            }
          })
        } else if (children && children.props && children.props.value === selectedValue) {
          result =
            typeof children.props.children === "string"
              ? children.props.children
              : children.props.displayText || selectedValue
        }

        return result
      }

      displayText = findDisplayText(children)
    }

    return displayText
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2.5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
      >
        <span className="block truncate text-sm">{selectedValue ? getDisplayText() : placeholder}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {Array.isArray(children)
            ? children.map((child, index) => {
                if (child && child.type === SelectItem) {
                  return (
                    <div
                      key={child.props.value || index}
                      onClick={() => handleSelect(child.props.value, child.props.displayText)}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-blue-900 text-gray-900 transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="block truncate flex-1">{child.props.children}</span>
                        {selectedValue === child.props.value && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    </div>
                  )
                }
                return child
              })
            : children &&
              children.type === SelectItem && (
                <div
                  onClick={() => handleSelect(children.props.value, children.props.displayText)}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-blue-900 text-gray-900 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="block truncate flex-1">{children.props.children}</span>
                    {selectedValue === children.props.value && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                </div>
              )}
        </div>
      )}
    </div>
  )
}

export function SelectItem({ value, children, displayText }) {
  // This component is just a placeholder - the actual rendering is handled by Select
  return null
}

// Legacy components for compatibility
export function SelectTrigger({ children }) {
  return <>{children}</>
}

export function SelectContent({ children }) {
  return <>{children}</>
}

export function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>
}
