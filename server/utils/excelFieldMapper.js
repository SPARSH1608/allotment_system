// Advanced field mapping utility for Excel processing
class ExcelFieldMapper {
    constructor() {
      this.fieldMappings = {
        // Core allotment fields
        LAPTOP_ID: {
          variations: ["laptop id", "asset id", "un no", "asset code", "laptop_id", "asset_id", "id", "laptop", "asset"],
          required: true,
          type: "string",
        },
        SERIAL_NUMBER: {
          variations: ["serial number", "serialnumber", "serial_number", "sn", "serial no", "serial"],
          required: false,
          type: "string",
        },
        ORGANIZATION_ID: {
          variations: ["organization id", "org id", "organization_id", "org_id", "client id", "client_id"],
          required: true,
          type: "string",
        },
        HANDOVER_DATE: {
          variations: [
            "handover date",
            "given date",
            "allotment date",
            "start date",
            "issue date",
            "handover_date",
            "given_date",
            "allotment_date",
          ],
          required: true,
          type: "date",
        },
        SURRENDER_DATE: {
          variations: ["surrender date", "return date", "end date", "surrender_date", "return_date", "end_date"],
          required: false,
          type: "date",
        },
        RENT_PER_30_DAYS: {
          variations: [
            "rent per 30 days",
            "monthly rent",
            "rent_per_30_days",
            "monthly_rent",
            "rent",
            "rental",
            "rent amount",
          ],
          required: true,
          type: "number",
        },
        CURRENT_MONTH_DAYS: {
          variations: ["current month days", "days", "rental days", "current_month_days", "month days"],
          required: false,
          type: "number",
          default: 30,
        },
        CURRENT_MONTH_RENT: {
          variations: ["current month rent", "current rent", "current_month_rent", "prorated rent", "prorated_rent"],
          required: false,
          type: "number",
        },
        LOCATION: {
          variations: ["location", "site", "address", "city", "branch", "office"],
          required: true,
          type: "string",
        },
        STATUS: {
          variations: ["status", "allotment status", "current status", "state"],
          required: false,
          type: "string",
          default: "Active",
        },
        NOTES: {
          variations: ["notes", "remarks", "comments", "description", "note"],
          required: false,
          type: "string",
        },
      }
    }
  
    // Normalize field names for comparison
    normalizeFieldName(fieldName) {
      return fieldName
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
    }
  
    // Calculate similarity score between two strings
    calculateSimilarity(str1, str2) {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1
  
      if (longer.length === 0) return 1.0
  
      const editDistance = this.levenshteinDistance(longer, shorter)
      return (longer.length - editDistance) / longer.length
    }
  
    // Calculate Levenshtein distance
    levenshteinDistance(str1, str2) {
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
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1, // deletion
            )
          }
        }
      }
  
      return matrix[str2.length][str1.length]
    }
  
    // Auto-detect field mappings from headers
    detectMappings(headers) {
      const mappings = {}
      const normalizedHeaders = headers.map((header, index) => ({
        original: header,
        normalized: this.normalizeFieldName(header),
        index,
      }))
  
      for (const [fieldKey, fieldConfig] of Object.entries(this.fieldMappings)) {
        let bestMatch = null
        let bestScore = 0
  
        normalizedHeaders.forEach((header) => {
          fieldConfig.variations.forEach((variation) => {
            const normalizedVariation = this.normalizeFieldName(variation)
            let score = 0
  
            // Exact match gets highest score
            if (header.normalized === normalizedVariation) {
              score = 100
            }
            // Contains match
            else if (header.normalized.includes(normalizedVariation) || normalizedVariation.includes(header.normalized)) {
              score = 85
            }
            // Similarity-based matching
            else {
              const similarity = this.calculateSimilarity(header.normalized, normalizedVariation)
              score = similarity * 70
            }
  
            // Word-based matching for compound fields
            const headerWords = header.normalized.split(" ")
            const variationWords = normalizedVariation.split(" ")
            const commonWords = headerWords.filter((word) => variationWords.includes(word))
            if (commonWords.length > 0) {
              const wordScore = (commonWords.length / Math.max(headerWords.length, variationWords.length)) * 60
              score = Math.max(score, wordScore)
            }
  
            if (score > bestScore && score > 50) {
              bestScore = score
              bestMatch = {
                originalHeader: header.original,
                normalizedHeader: header.normalized,
                index: header.index,
                confidence: Math.round(score),
                matchedVariation: variation,
              }
            }
          })
        })
  
        if (bestMatch) {
          mappings[fieldKey] = {
            ...bestMatch,
            fieldConfig,
          }
        }
      }
  
      return mappings
    }
  
    // Validate mappings and suggest improvements
    validateMappings(mappings) {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
      }
  
      // Check for required fields
      for (const [fieldKey, fieldConfig] of Object.entries(this.fieldMappings)) {
        if (fieldConfig.required && !mappings[fieldKey]) {
          validation.isValid = false
          validation.errors.push({
            field: fieldKey,
            message: `Required field '${fieldKey}' not found in headers`,
            suggestions: fieldConfig.variations.slice(0, 3),
          })
        }
      }
  
      // Check for low confidence mappings
      for (const [fieldKey, mapping] of Object.entries(mappings)) {
        if (mapping.confidence < 70) {
          validation.warnings.push({
            field: fieldKey,
            message: `Low confidence mapping for '${fieldKey}' (${mapping.confidence}%)`,
            currentMapping: mapping.originalHeader,
            suggestions: this.fieldMappings[fieldKey]?.variations.slice(0, 3) || [],
          })
        }
      }
  
      return validation
    }
  
    // Get mapping statistics
    getMappingStats(mappings) {
      const stats = {
        totalFields: Object.keys(this.fieldMappings).length,
        mappedFields: Object.keys(mappings).length,
        requiredFieldsMapped: 0,
        averageConfidence: 0,
        highConfidenceMappings: 0,
        mediumConfidenceMappings: 0,
        lowConfidenceMappings: 0,
      }
  
      let totalConfidence = 0
  
      for (const [fieldKey, mapping] of Object.entries(mappings)) {
        if (this.fieldMappings[fieldKey]?.required) {
          stats.requiredFieldsMapped++
        }
  
        totalConfidence += mapping.confidence
  
        if (mapping.confidence >= 90) {
          stats.highConfidenceMappings++
        } else if (mapping.confidence >= 70) {
          stats.mediumConfidenceMappings++
        } else {
          stats.lowConfidenceMappings++
        }
      }
  
      stats.averageConfidence = stats.mappedFields > 0 ? Math.round(totalConfidence / stats.mappedFields) : 0
  
      return stats
    }
  }
  
  module.exports = ExcelFieldMapper
  