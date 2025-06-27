// Field mapping configurations for different Excel formats
export const FIELD_MAPPINGS = {
    // Common field variations and their mappings
    SERIAL_NUMBER: [
      "serial number",
      "serialnumber",
      "serial_number",
      "serial no",
      "serialno",
      "asset code",
      "assetcode",
      "asset_code",
      "un no",
      "unno",
      "un_no",
    ],
    MODEL: ["model", "model no", "modelno", "model_no", "model number", "make", "laptop model", "product model"],
    PROCESSOR: ["processor", "cpu", "processor type", "processor_type", "processortype"],
    RAM: ["ram", "memory", "ram size", "ramsize", "ram_size"],
    STORAGE: [
      "storage",
      "hdd",
      "ssd",
      "hard disk",
      "harddisk",
      "hard_disk",
      "storage size",
      "storagesize",
      "storage_size",
    ],
    HANDOVER_DATE: [
      "handover date",
      "handoverdate",
      "handover_date",
      "given date",
      "givendate",
      "given_date",
      "allotment date",
      "allotmentdate",
      "allotment_date",
    ],
    RETURN_DATE: [
      "return date",
      "returndate",
      "return_date",
      "surrender date",
      "surrenderdate",
      "surrender_date",
      "expected return",
      "expectedreturn",
    ],
    RENT: [
      "rent",
      "rental",
      "monthly rent",
      "monthlyrent",
      "monthly_rent",
      "rent amount",
      "rentamount",
      "rent_amount",
      "current month rental",
    ],
    LOCATION: ["location", "site", "office", "branch", "city"],
    ORGANIZATION: ["organization", "org", "company", "client", "customer", "organization name"],
    CONTACT_PERSON: [
      "contact person",
      "contactperson",
      "contact_person",
      "assigned to",
      "assignedto",
      "assigned_to",
      "employee",
      "user",
    ],
    CONTACT_EMAIL: ["email", "contact email", "contactemail", "contact_email", "user email"],
    CONTACT_PHONE: [
      "phone",
      "mobile",
      "contact phone",
      "contactphone",
      "contact_phone",
      "phone number",
      "phonenumber",
      "phone_number",
    ],
    GENERATION: ["generation", "gen", "processor gen", "processorgen", "processor_gen"],
    WINDOWS: ["windows", "os", "operating system", "operatingsystem", "operating_system"],
    MS_OFFICE: ["ms office", "msoffice", "ms_office", "office", "ms office key", "office key"],
    CURRENT_MONTH_DAYS: ["current month days", "currentmonthdays", "current_month_days", "days"],
  }
  
  // Auto-detect field mappings from Excel headers
  export function detectFieldMappings(headers) {
    const mappings = {}
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim())
  
    Object.keys(FIELD_MAPPINGS).forEach((field) => {
      const variations = FIELD_MAPPINGS[field]
  
      for (let i = 0; i < normalizedHeaders.length; i++) {
        const header = normalizedHeaders[i]
  
        if (variations.some((variation) => header.includes(variation) || variation.includes(header))) {
          mappings[field] = {
            index: i,
            header: headers[i],
            confidence: calculateConfidence(header, variations),
          }
          break
        }
      }
    })
  
    return mappings
  }
  
  // Calculate confidence score for field mapping
  function calculateConfidence(header, variations) {
    let maxScore = 0
  
    variations.forEach((variation) => {
      if (header === variation) {
        maxScore = Math.max(maxScore, 1.0)
      } else if (header.includes(variation) || variation.includes(header)) {
        maxScore = Math.max(maxScore, 0.8)
      } else {
        // Calculate similarity score
        const similarity = calculateSimilarity(header, variation)
        maxScore = Math.max(maxScore, similarity)
      }
    })
  
    return maxScore
  }
  
  // Calculate string similarity
  function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
  
    if (longer.length === 0) return 1.0
  
    const editDistance = levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }
  
  // Levenshtein distance calculation
  function levenshteinDistance(str1, str2) {
    const matrix = []
  
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
  
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
  
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }
  
    return matrix[str2.length][str1.length]
  }
  
  // Transform Excel row data to allotment object
  export function transformRowToAllotment(row, mappings, organizationId) {
    const allotment = {
      organizationId: organizationId,
    }
  // console.log("Transforming row to allotment:", row, mappings, organizationId)
    // Map each field based on detected mappings
    Object.keys(mappings).forEach((field) => {
      const mapping = mappings[field]
      const value = row[mapping.index]
  
      if (value !== undefined && value !== null && value !== "") {
        switch (field) {
          case "SERIAL_NUMBER":
            allotment.productSerialNumber = String(value).trim()
            break
          case "MODEL":
            allotment.productModel = String(value).trim()
            break
          case "PROCESSOR":
            allotment.processor = String(value).trim()
            break
          case "RAM":
            allotment.ram = parseRAM(value)
            break
          case "STORAGE":
            allotment.storage = parseStorage(value)
            break
          case "HANDOVER_DATE":
            allotment.handoverDate = parseDate(value)
            break
            case "RETURN_DATE":
              allotment.returnDate = parseDate(value);
              allotment.expectedReturnDate = parseDate(value);
              break;
          case "RENT":
            allotment.monthlyRent = Number.parseFloat(value) || 0
            break
          case "LOCATION":
            allotment.location = String(value).trim()
            break
          case "CONTACT_PERSON":
            allotment.contactPerson = String(value).trim()
            break
          case "CONTACT_EMAIL":
            allotment.contactEmail = String(value).trim()
            break
          case "CONTACT_PHONE":
            allotment.contactPhone = String(value).trim()
            break
          case "GENERATION":
            allotment.generation = String(value).trim()
            break
          case "WINDOWS":
            allotment.operatingSystem = String(value).trim()
            break
          case "MS_OFFICE":
            allotment.msOfficeKey = String(value).trim()
            break
          case "CURRENT_MONTH_DAYS":
            allotment.currentMonthDays = Number.parseInt(value) || 30
            break
        }
      }
    })
  
    return allotment
  }
  
  // Parse RAM value (e.g., "8GB", "16 GB", "8192MB")
  function parseRAM(value) {
    const str = String(value).toUpperCase().replace(/\s/g, "")
  
    if (str.includes("GB")) {
      return Number.parseInt(str.replace("GB", "")) || 0
    } else if (str.includes("MB")) {
      return Math.round(Number.parseInt(str.replace("MB", "")) / 1024) || 0
    }
  
    return Number.parseInt(value) || 0
  }
  
  // Parse storage value (e.g., "256SSD", "512 GB", "1TB")
  function parseStorage(value) {
    const str = String(value).toUpperCase().replace(/\s/g, "")
  
    if (str.includes("TB")) {
      return Number.parseInt(str.replace("TB", "")) * 1024 || 0
    } else if (str.includes("GB")) {
      return Number.parseInt(str.replace(/GB|SSD|HDD/g, "")) || 0
    }
  
    return Number.parseInt(value) || 0
  }
  
  // Parse date value
  function parseDate(value) {
    if (!value) return null
// console.log("Parsing date value:", value,typeof value)

    // Handle Excel date serial numbers
    if (typeof value === "number") {
      const excelEpoch = new Date(1900, 0, 1)
      const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000)
      // Return as DD-MM-YYYY
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()
      // console.log("Parsed date from Excel serial:", date, `${day}-${month}-${year}`)
      return `${day}-${month}-${year}`
    }

    // Handle string dates in D-M-YYYY or DD-MM-YYYY format
    if (typeof value === "string") {
      // Match D-M-YYYY or DD-MM-YYYY
      const dmY = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/
      const match = value.match(dmY)
      if (match) {
        const day = String(parseInt(match[1], 10)).padStart(2, "0")
        const month = String(parseInt(match[2], 10)).padStart(2, "0")
        const year = match[3]
        return `${day}-${month}-${year}`
      }
      // Fallback to Date parsing
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
      }
    }

    return null
  }
  
  // Validate allotment data
  export function validateAllotmentData(allotment) {
    const errors = []

    // Allow "0000" as a valid serial number
    if (!allotment.productSerialNumber || allotment.productSerialNumber.trim() === "") {
      errors.push("Product serial number is required")
    }

    if (!allotment.organizationId) {
      errors.push("Organization ID is required")
    }

    // Allow missing handover date (backend will set default)
    // if (!allotment.handoverDate) {
    //   errors.push("Handover date is required")
    // }

    // Allow missing or zero monthly rent (backend will set default)
    // if (!allotment.monthlyRent || allotment.monthlyRent <= 0) {
    //   errors.push("Valid monthly rent is required")
    // }

    if (allotment.contactEmail && !isValidEmail(allotment.contactEmail)) {
      errors.push("Invalid email format")
    }

    return errors
  }
  
  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
