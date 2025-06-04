const mongoose = require("mongoose")

const invoiceItemSchema = new mongoose.Schema({
  laptopId: {
    type: String,
    required: true,
    ref: "Product",
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  rate: {
    type: Number,
    required: true,
    min: [0, "Rate cannot be negative"],
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount cannot be negative"],
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
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      ref: "Organization",
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
    billingPeriod: {
      type: String,
      required: [true, "Billing period is required"],
      trim: true,
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    taxRate: {
      type: Number,
      required: true,
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100%"],
      default: 18,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: [0, "Tax amount cannot be negative"],
    },
    discountRate: {
      type: Number,
      min: [0, "Discount rate cannot be negative"],
      max: [100, "Discount rate cannot exceed 100%"],
      default: 0,
    },
    discountAmount: {
      type: Number,
      min: [0, "Discount amount cannot be negative"],
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
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
      enum: ["Cash", "Bank Transfer", "Cheque", "Online", "Other"],
    },
  },
  {
    timestamps: true,
  },
)

// Calculate amounts before saving
invoiceSchema.pre("save", function (next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0)

  // Calculate tax amount
  this.taxAmount = (this.subtotal * this.taxRate) / 100

  // Calculate discount amount
  this.discountAmount = (this.subtotal * this.discountRate) / 100

  // Calculate total amount
  this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount

  next()
})

// Index for better performance
invoiceSchema.index({ invoiceNumber: 1 })
invoiceSchema.index({ organizationId: 1 })
invoiceSchema.index({ status: 1 })
invoiceSchema.index({ invoiceDate: 1 })
invoiceSchema.index({ dueDate: 1 })

module.exports = mongoose.model("Invoice", invoiceSchema)
