const mongoose = require("mongoose")

// Invoice Item Schema (match Product model fields)
const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    ref: "Product",
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  serialNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  processor: {
    type: String,
    required: true,
    trim: true,
  },
  processorGen: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  ram: {
    type: String,
    required: true,
    trim: true,
  },
  ssd: {
    type: String,
    required: true,
    trim: true,
  },
  hdd: {
    type: String,
    trim: true,
    default: "None",
  },
  windowsVersion: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, "Quantity must be at least 1"],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  ratePerDay: {
    type: Number,
    required: true,
    min: [0, "Rate cannot be negative"],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, "Total amount cannot be negative"],
  },
  description: {
    type: String,
    required: true,
  },
})

// Company Details Schema (no change needed)
const companyDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Company address is required"],
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile number is required"],
    trim: true,
  },
  gstin: {
    type: String,
    required: [true, "GSTIN is required"],
    trim: true,
    uppercase: true,
  },
  bankDetails: {
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    bankAddress: {
      type: String,
      required: [true, "Bank address is required"],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, "IFSC code is required"],
      trim: true,
      uppercase: true,
    },
  },
})

// Organization Details Schema (match Organization model fields)
const organizationDetailsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Organization ID is required"],
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: [true, "Organization name is required"],
    trim: true,
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  gstin: {
    type: String,
    trim: true,
    uppercase: true,
  },
})

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    invoiceDate: {
      type: Date,
      required: [true, "Invoice date is required"],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // Company details (invoice issuer)
    companyDetails: {
      type: companyDetailsSchema,
      required: true,
    },

    // Organization details (invoice recipient)
    organizationDetails: {
      type: organizationDetailsSchema,
      required: true,
    },

    // Invoice items
    items: [invoiceItemSchema],

    // Financial calculations
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    sgstRate: {
      type: Number,
      required: true,
      min: [0, "SGST rate cannot be negative"],
      max: [50, "SGST rate cannot exceed 50%"],
      default: 9,
    },
    sgstAmount: {
      type: Number,
      required: true,
      min: [0, "SGST amount cannot be negative"],
    },
    cgstRate: {
      type: Number,
      required: true,
      min: [0, "CGST rate cannot be negative"],
      max: [50, "CGST rate cannot exceed 50%"],
      default: 9,
    },
    cgstAmount: {
      type: Number,
      required: true,
      min: [0, "CGST amount cannot be negative"],
    },
    totalTaxAmount: {
      type: Number,
      required: true,
      min: [0, "Total tax amount cannot be negative"],
    },
    grandTotal: {
      type: Number,
      required: true,
      min: [0, "Grand total cannot be negative"],
    },
   

    // Invoice status and metadata
    status: {
      type: String,
      enum: ["Draft", "Sent", "Paid", "Overdue", "Cancelled"],
      default: "Draft",
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque", "Online", "UPI", "Other"],
    },

    // Default declarations
    declarations: {
      type: [String],
      default: [
        "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
        "This is a computer generated invoice and does not require physical signature.",
        "Subject to jurisdiction of courts in [City Name] only.",
        "Payment terms: Net 30 days from invoice date.",
      ],
    },

    // Authority signature
    authorizedSignatory: {
      name: {
        type: String,
        default: "Authorized Signatory",
      },
      designation: {
        type: String,
        default: "Manager",
      },
    },
  },
  {
    timestamps: true,
  },
)

// Calculate amounts before saving
invoiceSchema.pre("save", function (next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalAmount, 0)

  // Calculate SGST amount
  this.sgstAmount = (this.subtotal * this.sgstRate) / 100

  // Calculate CGST amount
  this.cgstAmount = (this.subtotal * this.cgstRate) / 100

  // Calculate total tax amount
  this.totalTaxAmount = this.sgstAmount + this.cgstAmount

  // Calculate grand total
  this.grandTotal = this.subtotal + this.totalTaxAmount

  // Convert grand total to words
  this.grandTotalInWords = this.convertNumberToWords(this.grandTotal)

  next()
})

// Method to convert number to words
invoiceSchema.methods.convertNumberToWords = function (amount) {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ]
  
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ]
  
  const scales = ["", "Thousand", "Lakh", "Crore"]
  
  if (amount === 0) return "Zero Rupees Only"
  
  const convertHundreds = (num) => {
    let result = ""
    
    if (num > 99) {
      result += ones[Math.floor(num / 100)] + " Hundred "
      num %= 100
    }
    
    if (num > 19) {
      result += tens[Math.floor(num / 10)] + " "
      num %= 10
    }
    
    if (num > 0) {
      result += ones[num] + " "
    }
    
    return result
  }
  
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  
  if (rupees === 0) {
    return paise > 0 ? `${convertHundreds(paise)}Paise Only` : "Zero Rupees Only"
  }
  
  let result = ""
  let scaleIndex = 0
  
  // Handle crores
  if (rupees >= 10000000) {
    const crores = Math.floor(rupees / 10000000)
    result += convertHundreds(crores) + "Crore "
    let remainingRupees = rupees % 10000000
    rupees = remainingRupees
  }
  
  // Handle lakhs
  if (rupees >= 100000) {
    const lakhs = Math.floor(rupees / 100000)
    result += convertHundreds(lakhs) + "Lakh "
    let remainingRupees = rupees % 100000
    rupees = remainingRupees
  }
  
  // Handle thousands
  if (rupees >= 1000) {
    const thousands = Math.floor(rupees / 1000)
    result += convertHundreds(thousands) + "Thousand "
    let remainingRupees = rupees % 1000
    rupees = remainingRupees
  }
  
  // Handle hundreds
  if (rupees > 0) {
    result += convertHundreds(rupees)
  }
  
  result += "Rupees"
  
  if (paise > 0) {
    result += " and " + convertHundreds(paise) + "Paise"
  }
  
  result += " Only"
  
  return result.trim()
}

// Indexes for better performance
invoiceSchema.index({ invoiceNumber: 1 })
invoiceSchema.index({ "organizationDetails.name": 1 })
invoiceSchema.index({ status: 1 })
invoiceSchema.index({ invoiceDate: 1 })
invoiceSchema.index({ dueDate: 1 })

module.exports = mongoose.model("Invoice", invoiceSchema)
