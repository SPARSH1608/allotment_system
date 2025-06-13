// Date formatting utilities
export const formatDate = (date) => {
    if (!date) return "N/A"
  
    const d = new Date(date)
    if (isNaN(d.getTime())) return "Invalid Date"
  
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  export const formatDateTime = (date) => {
    if (!date) return "N/A"
  
    const d = new Date(date)
    if (isNaN(d.getTime())) return "Invalid Date"
  
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  // Currency formatting
  export const formatCurrency = (amount, currency = "USD") => {
    if (amount === null || amount === undefined) return "N/A"
  
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  
  // Number formatting
  export const formatNumber = (number) => {
    if (number === null || number === undefined) return "N/A"
  
    return new Intl.NumberFormat("en-US").format(number)
  }
  
  // File size formatting
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
  
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
  
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
  
  // Duration formatting
  export const formatDuration = (days) => {
    if (!days) return "N/A"
  
    if (days < 30) {
      return `${days} day${days !== 1 ? "s" : ""}`
    } else if (days < 365) {
      const months = Math.floor(days / 30)
      const remainingDays = days % 30
      return `${months} month${months !== 1 ? "s" : ""}${remainingDays > 0 ? ` ${remainingDays} day${remainingDays !== 1 ? "s" : ""}` : ""}`
    } else {
      const years = Math.floor(days / 365)
      const remainingDays = days % 365
      return `${years} year${years !== 1 ? "s" : ""}${remainingDays > 0 ? ` ${remainingDays} day${remainingDays !== 1 ? "s" : ""}` : ""}`
    }
  }
  