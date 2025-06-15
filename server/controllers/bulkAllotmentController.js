const XLSX = require("xlsx")
const moment = require("moment")
const Allotment = require("../models/Allotment")
const Product = require("../models/Product")
const Organization = require("../models/Organization")
const BulkUploadHistory = require("../models/BulkUploadHistory")
const asyncHandler = require("../middleware/asyncHandler")

// Field mapping configurations
const FIELD_MAPPINGS = {
  // Laptop/Asset identification
  LAPTOP_ID: [
    "laptop id",
    "asset id",
    "un no",
    "asset code",
    "serial number",
    "serialnumber",
    "asset_id",
    "laptop_id",
    "id",
  ],
  SERIAL_NUMBER: ["serial number", "serialnumber", "serial_number", "sn", "serial no", "asset code"],
  MODEL: ["model", "model no", "model number", "laptop model", "make", "model_no"],

  // Organization details
  ORGANIZATION_ID: ["organization id", "org id", "organization_id", "org_id", "client id"],
  ORGANIZATION_NAME: ["organization name", "org name", "client name", "company name", "organization"],

  // Dates
  HANDOVER_DATE: [
    "handover date",
    "given date",
    "allotment date",
    "start date",
    "issue date",
    "handover_date",
    "given_date",
  ],
  SURRENDER_DATE: ["surrender date", "return date", "end date", "surrender_date", "return_date"],
  DUE_DATE: ["due date", "due_date", "expected return", "expected_return"],

  // Financial
  RENT: ["rent", "rental", "rent amount", "monthly rent", "rent_amount", "rental_amount"],
  RENT_PER_30_DAYS: ["rent per 30 days", "monthly rent", "rent_per_30_days", "monthly_rent"],
  CURRENT_MONTH_DAYS: ["current month days", "days", "rental days", "current_month_days"],
  CURRENT_MONTH_RENT: ["current month rent", "current rent", "current_month_rent", "prorated_rent"],

  // Location and other details
  LOCATION: ["location", "site", "address", "city", "branch"],
  NOTES: ["notes", "remarks", "comments", "description"],
  STATUS: ["status", "allotment status", "current status"],

  // Hardware specifications (for validation)
  PROCESSOR: ["processor", "cpu", "processor type"],
  RAM: ["ram", "memory", "ram size"],
  STORAGE: ["storage", "hdd", "ssd", "hard disk"],
  COMPANY: ["company", "brand", "manufacturer", "make"],
}

// Utility function to normalize field names
const normalizeFieldName = (fieldName) => {
  return fieldName
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
}

// Auto-detect field mappings
const detectFieldMappings = (headers) => {
  const mappings = {}
  const normalizedHeaders = headers.map(normalizeFieldName)

  for (const [fieldKey, variations] of Object.entries(FIELD_MAPPINGS)) {
    let bestMatch = null
    let bestScore = 0

    normalizedHeaders.forEach((header, index) => {
      variations.forEach((variation) => {
        const normalizedVariation = normalizeFieldName(variation)
        let score = 0

        // Exact match
        if (header === normalizedVariation) {
          score = 100
        }
        // Contains match
        else if (header.includes(normalizedVariation) || normalizedVariation.includes(header)) {
          score = 80
        }
        // Partial match
        else {
          const words1 = header.split(" ")
          const words2 = normalizedVariation.split(" ")
          const commonWords = words1.filter((word) => words2.includes(word))
          score = (commonWords.length / Math.max(words1.length, words2.length)) * 60
        }

        if (score > bestScore && score > 50) {
          bestScore = score
          bestMatch = {
            originalHeader: headers[index],
            index,
            confidence: score,
          }
        }
      })
    })

    if (bestMatch) {
      mappings[fieldKey] = bestMatch
    }
  }

  return mappings
}

// Parse and validate data
const parseRowData = (row, mappings, sheetName) => {
  const data = {}
  const errors = []

  try {
    // Map fields based on detected mappings
    for (const [fieldKey, mapping] of Object.entries(mappings)) {
      if (mapping && mapping.originalHeader && row[mapping.originalHeader] !== undefined) {
        let value = row[mapping.originalHeader]

        // Skip empty values
        if (value === null || value === undefined || value === "") {
          continue
        }

        // Convert Excel serial dates
        const dateFields = ["HANDOVER_DATE", "SURRENDER_DATE", "DUE_DATE", "handoverDate", "surrenderDate", "dueDate","RETURN_DATE"]    ;
        if (dateFields.includes(fieldKey) && typeof value === "number") {
          const excelEpoch = new Date(1900, 0, 1);
          const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
          value = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
        }
        // Parse dates from strings
        if (fieldKey.includes("DATE") && typeof value === "string") {
          const parsedDate = moment(value, [
            "DD-MM-YYYY",
            "MM-DD-YYYY",
            "YYYY-MM-DD",
            "DD/MM/YYYY",
            "MM/DD/YYYY",
            "YYYY/MM/DD",
          ])
          if (parsedDate.isValid()) {
            value = parsedDate.toDate()
          }
        }

        // Parse numeric values
        if (["RENT", "RENT_PER_30_DAYS", "CURRENT_MONTH_RENT"].includes(fieldKey)) {
          value = Number.parseFloat(value) || 0
        }

        if (fieldKey === "CURRENT_MONTH_DAYS") {
          value = Number.parseInt(value) || 30
        }

        // Clean string values
        if (typeof value === "string") {
          value = value.toString().trim()
        }

        data[fieldKey] = value
      }
    }

    // Set organization ID from sheet name if not found in data
    if (!data.ORGANIZATION_ID && sheetName && sheetName !== "Sheet1") {
      data.ORGANIZATION_ID = sheetName.toUpperCase()
    }

    // Set defaults
    data.CURRENT_MONTH_DAYS = data.CURRENT_MONTH_DAYS || 30
    data.HANDOVER_DATE = data.HANDOVER_DATE || new Date()
    data.STATUS = data.STATUS || "Active"
    if (!data.SURRENDER_DATE) {
        data.SURRENDER_DATE = "";
      }
      if (!data.HANDOVER_DATE) {
        data.HANDOVER_DATE = "";
      }
    // Calculate current month rent if not provided
    if (data.RENT_PER_30_DAYS && !data.CURRENT_MONTH_RENT) {
      data.CURRENT_MONTH_RENT = (data.RENT_PER_30_DAYS / 30) * data.CURRENT_MONTH_DAYS
    }

    return { data, errors }
  } catch (error) {
    errors.push({
      field: "general",
      error: `Error parsing row data: ${error.message}`,
    })
    return { data, errors }
  }
}

// Validate allotment data
const validateAllotmentData = async (data, rowIndex) => {
  const errors = []
console.log("Validating allotment data for row:", rowIndex, data)
  try {
    // Required field validation
    if (!data.LAPTOP_ID && !data.SERIAL_NUMBER) {
      errors.push({
        row: rowIndex,
        field: "laptop_id",
        error: "Either Laptop ID or Serial Number is required",
      })
    }

    if (!data.ORGANIZATION_ID) {
      errors.push({
        row: rowIndex,
        field: "organization_id",
        error: "Organization ID is required",
      })
    }

    // Validate laptop exists and is available
    if (data.LAPTOP_ID || data.SERIAL_NUMBER) {
      const laptopQuery = {}
      if (data.LAPTOP_ID) laptopQuery.id = data.LAPTOP_ID
      if (data.SERIAL_NUMBER) laptopQuery.serialNumber = data.SERIAL_NUMBER

      const laptop = await Product.findOne(laptopQuery)
      if (!laptop) {
        errors.push({
          row: rowIndex,
          field: "laptop_id",
          error: "Laptop not found in system",
        })
      } else if (laptop.status !== "Available") {
        errors.push({
          row: rowIndex,
          field: "laptop_id",
          error: `Laptop is currently ${laptop.status.toLowerCase()} and not available for allotment`,
        })
      }
    }

    // Validate organization exists
    if (data.ORGANIZATION_ID) {
      const organization = await Organization.findOne({ id: data.ORGANIZATION_ID })
      if (!organization) {
        errors.push({
          row: rowIndex,
          field: "organization_id",
          error: "Organization not found in system",
        })
      }
    }

    // Validate dates
    if (data.HANDOVER_DATE && isNaN(new Date(data.HANDOVER_DATE))) {
      errors.push({
        row: rowIndex,
        field: "handover_date",
        error: "Invalid handover date format",
      })
    }

    if (data.SURRENDER_DATE && isNaN(new Date(data.SURRENDER_DATE))) {
      errors.push({
        row: rowIndex,
        field: "surrender_date",
        error: "Invalid surrender date format",
      })
    }

    // Validate financial data
    if (data.RENT_PER_30_DAYS && (isNaN(data.RENT_PER_30_DAYS) || data.RENT_PER_30_DAYS < 0)) {
      errors.push({
        row: rowIndex,
        field: "rent_per_30_days",
        error: "Invalid rent amount",
      })
    }

    if (data.CURRENT_MONTH_DAYS && (data.CURRENT_MONTH_DAYS < 1 || data.CURRENT_MONTH_DAYS > 31)) {
      errors.push({
        row: rowIndex,
        field: "current_month_days",
        error: "Current month days must be between 1 and 31",
      })
    }

    return errors
  } catch (error) {
    return [
      {
        row: rowIndex,
        field: "validation",
        error: `Validation error: ${error.message}`,
      },
    ]
  }
}

// @desc    Preview bulk allotment data
// @route   POST /api/allotments/bulk-preview
// @access  Private
const previewBulkAllotments = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    })
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const preview = {
      sheets: [],
      totalRecords: 0,
      fieldMappings: {},
      validationSummary: {
        totalErrors: 0,
        totalWarnings: 0,
      },
    }

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length < 2) continue // Skip empty sheets

      const headers = jsonData[0]
      const dataRows = jsonData.slice(1, 11) // Preview first 10 rows

      // Detect field mappings
      const mappings = detectFieldMappings(headers)

      // Parse preview data
      const previewData = []
      let sheetErrors = 0

      for (let i = 0; i < dataRows.length; i++) {
        const rowObject = {}
        headers.forEach((header, index) => {
          rowObject[header] = dataRows[i][index]
        })

        const { data, errors } = parseRowData(rowObject, mappings, sheetName)
        const validationErrors = await validateAllotmentData(data, i + 2)

        previewData.push({
          rowIndex: i + 2,
          originalData: rowObject,
          parsedData: data,
          errors: [...errors, ...validationErrors],
        })

        sheetErrors += errors.length + validationErrors.length
      }

      preview.sheets.push({
        sheetName,
        organizationId: sheetName !== "Sheet1" ? sheetName.toUpperCase() : null,
        headers,
        mappings,
        previewData,
        totalRows: jsonData.length - 1,
        previewRows: dataRows.length,
        errors: sheetErrors,
      })

      preview.totalRecords += jsonData.length - 1
      preview.validationSummary.totalErrors += sheetErrors
    }

    res.status(200).json({
      success: true,
      data: preview,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error processing Excel file",
      error: error.message,
    })
  }
})

// @desc    Process bulk allotment upload
// @route   POST /api/allotments/bulk-upload
// @access  Private
const parseToISODate = (dateStr) => {
    if (!dateStr) return null;
    // Try to parse DD-MM-YYYY or DD/MM/YYYY
    const match = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.exec(dateStr);
    if (match) {
      // Convert to YYYY-MM-DD and return ISO string
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    // Try native Date parse (for ISO or already valid)
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  };
const processBulkAllotments = asyncHandler(async (req, res) => {
    console.log("Processing bulk allotments upload...")
  let uploadData = []
  let mappings = {}
  let fileName = req.file ? req.file.originalname : "bulk-allotment.json"
  let fileSize = req.file ? req.file.size : 0
// console.log(req.body)
  // Try to get data from options (JSON) if present
  if (req.body.options) {
    try {
      const options = typeof req.body.options === "string" ? JSON.parse(req.body.options) : req.body.options;
    //   console.log("Parsed options:", options);
      uploadData = options.data || [];
      mappings = options.mappings || {};
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid options JSON",
        error: err.message,
      });
    }
  } else if (req.body.data) {
    // Accept plain JSON body (not wrapped in options)
    uploadData = req.body.data || [];
    mappings = req.body.mappings || {};
  }
  console.log("Upload data length:", uploadData.length)

  // If no data in options, fallback to Excel file upload
  if (!uploadData.length && req.file) {
    // ... your existing Excel parsing logic here ...
    // (You can keep your old code for backward compatibility)
    return res.status(400).json({
      success: false,
      message: "Excel file upload not supported in this mode. Please use the web bulk upload.",
    })
  }

  if (!uploadData.length) {
    return res.status(400).json({
      success: false,
      message: "No data provided for bulk upload",
    })
  }

  const startTime = Date.now()
  const uploadId = `BULK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Create upload history record
  const uploadHistory = await BulkUploadHistory.create({
    id: uploadId,
    uploadType: "allotments",
    fileName,
    fileSize,
 
    status: "processing",
  })

  const results = {
    totalRecords: uploadData.length,
    successfulRecords: 0,
    failedRecords: 0,
    sheets: [],
    summary: {
      organizationsProcessed: 0,
      laptopsAllotted: 0,
      totalRentValue: 0,
    },
    errors: [],
  }
console.log("Starting bulk allotment processing..." ,uploadData)
  // Process each row in uploadData
  for (let i = 0; i < uploadData.length; i++) {
    const data = uploadData[i]
    // console.log(`Processing row ${i + 1}/${uploadData.length}`, data)
    const rowIndex = i + 2
    try {
      // Validate and process as in your original code
      // (You may want to call your validateAllotmentData here)
      // Generate allotment ID
      const allotmentCount = await Allotment.countDocuments()
      const allotmentId = `ALT${String(allotmentCount + results.successfulRecords + 1).padStart(4, "0")}`

      // Find laptop
      const laptopQuery = {};
      if (data.LAPTOP_ID) laptopQuery.id = data.LAPTOP_ID;
      if (data.SERIAL_NUMBER) laptopQuery.serialNumber = data.SERIAL_NUMBER;
      if (!laptopQuery.id && !laptopQuery.serialNumber && data.productSerialNumber) {
        laptopQuery.id = data.productSerialNumber; // <-- FIX: use id, not serialNumber
      }
 
      const laptop = await Product.findOne(laptopQuery)

      if (!laptop) {
        results.failedRecords++
        results.errors.push({
          row: rowIndex,
          field: "laptop_id",
          error: "Laptop not found in system",
        })
        continue
      }
      const orgIdValue = data.organizationId || data.ORGANIZATION_ID;
      const organization = await Organization.findOne({ id: orgIdValue });
      if (!organization) {
        results.failedRecords++;
        results.errors.push({
          row: rowIndex,
          field: "organization_id",
          error: "Organization not found in system",
        });
        continue;
      }
      
      const handoverDateValue = parseToISODate(
        data.handoverDate || data.HANDOVER_DATE
      );
      
      const dueDateValue = parseToISODate(
        data.dueDate ||
        data.DUE_DATE ||
        data.expectedReturnDate ||
        data.EXPECTED_RETURN_DATE
      );
      
      const surrenderDateValue = parseToISODate(
        data.surrenderDate ||
        data.SURRENDER_DATE ||
        data.returnDate ||
        data.RETURN_DATE
      );

      let status = "Active";
      if (surrenderDateValue) {
        status = "Returned";
      } else if (dueDateValue && new Date(dueDateValue) < new Date()) {
        status = "Overdue";
      }
    
      // Create allotment
      const allotmentData = {
        id: allotmentId,
        laptopId: laptop._id,
        organizationId: organization._id,
        handoverDate: handoverDateValue,
        dueDate: dueDateValue || undefined,         // <-- use dueDate for expected return
        surrenderDate: surrenderDateValue || undefined,
        rentPer30Days: data.monthlyRent || data.RENT_PER_30_DAYS || laptop.baseRent,
        currentMonthDays: data.currentMonthDays || data.CURRENT_MONTH_DAYS || 30,
        currentMonthRent:
          data.currentMonthRent ||
          data.CURRENT_MONTH_RENT ||
          ((data.monthlyRent || data.RENT_PER_30_DAYS || laptop.baseRent) / 30) *
            (data.currentMonthDays || data.CURRENT_MONTH_DAYS || 30),
        location: data.location || data.LOCATION || "Not specified",
        status,
        notes: data.notes || data.NOTES || "",
      };
      const allotment = await Allotment.create(allotmentData)

      // Update laptop status
      await Product.findOneAndUpdate(
        { id: laptop.id },
        {
          status: "Allotted",
          currentAllotmentId: allotment._id,
        },
      )

      // Update organization stats
      await Organization.findOneAndUpdate(
        { id: allotmentData.organizationId },
        {
          $inc: {
            totalAllotments: 1,
            activeAllotments: 1,
          },
        },
      )

      results.successfulRecords++
      results.summary.laptopsAllotted++
      results.summary.totalRentValue += allotmentData.currentMonthRent
    } catch (error) {
      results.failedRecords++
      results.errors.push({
        row: rowIndex,
        field: "processing",
        error: error.message,
      })
    }
  }

  // Update upload history
  const processingTime = Date.now() - startTime
  await BulkUploadHistory.findByIdAndUpdate(uploadHistory._id, {
    status: "completed",
    totalRecords: results.totalRecords,
    successfulRecords: results.successfulRecords,
    failedRecords: results.failedRecords,
    processingTime,
    sheets: results.sheets,
    summary: {
      ...results.summary,
      averageProcessingTimePerRecord: processingTime / results.totalRecords,
    },
  })

  res.status(200).json({
    success: true,
    message: `Bulk upload completed. ${results.successfulRecords} allotments created, ${results.failedRecords} failed.`,
    data: {
      uploadId,
      ...results,
      processingTime,
    },
  })
})

// @desc    Get bulk upload history
// @route   GET /api/allotments/bulk-history
// @access  Private
const getBulkUploadHistory = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const filter = { uploadType: "allotments" }
  if (req.query.status) filter.status = req.query.status
  if (req.query.uploadedBy) filter.uploadedBy = req.query.uploadedBy

  const history = await BulkUploadHistory.find(filter)
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await BulkUploadHistory.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: history.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: history,
  })
})

// @desc    Get bulk upload status
// @route   GET /api/allotments/bulk-status/:uploadId
// @access  Private
const getBulkUploadStatus = asyncHandler(async (req, res) => {
  const upload = await BulkUploadHistory.findOne({ id: req.params.uploadId }).populate("uploadedBy", "name email")

  if (!upload) {
    return res.status(404).json({
      success: false,
      message: "Upload not found",
    })
  }

  res.status(200).json({
    success: true,
    data: upload,
  })
})

// @desc    Download bulk upload template
// @route   GET /api/allotments/bulk-template
// @access  Private
const downloadBulkTemplate = asyncHandler(async (req, res) => {
  const templateData = [
    {
      "Asset ID": "LP001",
      "Serial Number": "LN123456789",
      "Organization ID": "ORG001",
      "Handover Date": "2024-01-15",
      "Surrender Date": "",
      "Rent Per 30 Days": 3000,
      "Current Month Days": 30,
      "Current Month Rent": 3000,
      Location: "Noida, UP",
      Status: "Active",
      Notes: "Initial allotment",
    },
  ]

  // Create workbook with multiple sheets as examples
  const workbook = XLSX.utils.book_new()

  // Main template sheet
  const mainSheet = XLSX.utils.json_to_sheet(templateData)
  XLSX.utils.book_append_sheet(workbook, mainSheet, "Allotments_Template")

  // Organization-specific sheets (examples)
  const org1Data = templateData.map((item) => ({ ...item, "Organization ID": "ORG001" }))
  const org2Data = templateData.map((item) => ({ ...item, "Organization ID": "ORG002" }))

  const org1Sheet = XLSX.utils.json_to_sheet(org1Data)
  const org2Sheet = XLSX.utils.json_to_sheet(org2Data)

  XLSX.utils.book_append_sheet(workbook, org1Sheet, "ORG001")
  XLSX.utils.book_append_sheet(workbook, org2Sheet, "ORG002")

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

  res.setHeader("Content-Disposition", "attachment; filename=bulk_allotments_template.xlsx")
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  res.send(buffer)
})

module.exports = {
  previewBulkAllotments,
  processBulkAllotments,
  getBulkUploadHistory,
  getBulkUploadStatus,
  downloadBulkTemplate,
}
