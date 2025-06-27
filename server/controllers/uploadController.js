const multer = require("multer")
const XLSX = require("xlsx")
const Product = require("../models/Product")
const Organization = require("../models/Organization")
const asyncHandler = require("../middleware/asyncHandler")

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only Excel files are allowed"), false)
    }
  },
})

// @desc    Upload products from Excel file
// @route   POST /api/upload/products
// @access  Public
const uploadProducts = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    })
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const results = {
      success: [],
      errors: [],
      total: data.length,
    }

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      try {
        // Map Excel columns to our schema
        const productData = {
          id: row["Asset ID"] || row["ID"] || row["AssetID"],
          model: row["Model"] || row["Model No"],
          serialNumber: row["Serial Number"] || row["SerialNumber"] || row["SN"],
          company: row["Company"] || row["Brand"] || row["Manufacturer"],
          processor: row["Processor"] || row["CPU"],
          processorGen: row["Processor Generation"] || row["Gen"] || row["Generation"],
          ram: row["RAM"] || row["Memory"],
          ssd: row["SSD"] || row["Storage"],
          hdd: row["HDD"] || "None",
          windowsVersion: row["OS"] || row["Windows Version"] || row["Operating System"],
          baseRent: Number.parseFloat(row["Base Rent"] || row["Rent"] || row["Price"]) || 0,
        }

        // Set serialNumber to "0000" if empty or missing
        if (!productData.serialNumber || productData.serialNumber.trim() === "") {
          productData.serialNumber = "0000"
        }

        // Validate required fields
        if (!productData.id || !productData.model || !productData.serialNumber) {
          results.errors.push({
            row: i + 1,
            error: "Missing required fields (Asset ID, Model, Serial Number)",
          })
          continue
        }

        // Check if product already exists
        const existingProduct = await Product.findOne({
          $or: [{ id: productData.id }],
        })

        if (existingProduct) {
          results.errors.push({
            row: i + 1,
            error: `Product with ID ${productData.id} or Serial Number ${productData.serialNumber} already exists`,
          })
          continue
        }

        // Create product
        const product = await Product.create(productData)
        results.success.push({
          row: i + 1,
          product, 
        })
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error.message,
        })
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.total} rows. ${results.success.length} products created, ${results.errors.length} errors.`,
      data: results,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error processing Excel file",
      error: error.message,
    })
  }
})

// @desc    Upload organizations from Excel file
// @route   POST /api/upload/organizations
// @access  Public
const uploadOrganizations = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    })
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const results = {
      success: [],
      errors: [],
      total: data.length,
    }

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      try {
        // Generate organization ID if not provided
        const count = await Organization.countDocuments()

        // Map Excel columns to our schema
        const organizationData = {
          id: row["Organization ID"] || row["ID"] || `ORG${String(count + i + 1).padStart(3, "0")}`,
          name: row["Organization Name"] || row["Name"] || row["Company"],
          location: row["Location"] || row["Address"] || row["City"],
          contactPerson: row["Contact Person"] || row["Contact"] || row["Representative"],
          contactEmail: row["Email"] || row["Contact Email"],
          contactPhone: row["Phone"] || row["Contact Phone"] || row["Mobile"],
        }

        // Validate required fields
        if (!organizationData.name || !organizationData.location) {
          results.errors.push({
            row: i + 1,
            error: "Missing required fields (Name, Location)",
          })
          continue
        }

        // Check if organization already exists
        const existingOrganization = await Organization.findOne({
          $or: [{ id: organizationData.id }, { name: organizationData.name }],
        })

        if (existingOrganization) {
          results.errors.push({
            row: i + 1,
            error: `Organization with ID ${organizationData.id} or Name ${organizationData.name} already exists`,
          })
          continue
        }

        // Create organization
        const organization = await Organization.create(organizationData)
        results.success.push({
          row: i + 1,
          id: organization.id,
          name: organization.name,
        })
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error.message,
        })
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.total} rows. ${results.success.length} organizations created, ${results.errors.length} errors.`,
      data: results,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error processing Excel file",
      error: error.message,
    })
  }
})

// @desc    Download sample Excel template
// @route   GET /api/upload/template/:type
// @access  Public
const downloadTemplate = asyncHandler(async (req, res) => {
  const { type } = req.params

  let templateData = []
  let filename = ""

  if (type === "products") {
    templateData = [
      {
        "Asset ID": "LP001",
        Model: "ThinkPad E14",
        "Serial Number": "LN123456789",
        Company: "Lenovo",
        Processor: "i5",
        "Processor Generation": "8TH",
        RAM: "8GB",
        SSD: "256GB",
        HDD: "None",
        OS: "Win10",
        "Base Rent": 3000,
      },
    ]
    filename = "products_template.xlsx"
  } else if (type === "organizations") {
    templateData = [
      {
        "Organization ID": "ORG001",
        "Organization Name": "TechCorp Solutions",
        Location: "Noida, UP",
        "Contact Person": "Rajesh Kumar",
        Email: "rajesh@techcorp.com",
        Phone: "+91 98765 43210",
      },
    ]
    filename = "organizations_template.xlsx"
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid template type",
    })
  }

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(templateData)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template")

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

  res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  res.send(buffer)
})

module.exports = {
  upload,
  uploadProducts,
  uploadOrganizations,
  downloadTemplate,
}
