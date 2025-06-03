"use client"

export function Input({
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  required = false,
  id,
  ...props
}) {
  const baseClasses =
    "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"

  return (
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  )
}
