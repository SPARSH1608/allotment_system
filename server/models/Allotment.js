const mongoose = require("mongoose")

const allotmentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Allotment ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    laptopId: {
      type: String,
      required: [true, "Laptop ID is required"],
      ref: "Product",
    },
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      ref: "Organization",
    },
    handoverDate: {
      type: Date,
      required: [true, "Handover date is required"],
      default: Date.now,
    },
    surrenderDate: {
      type: Date,
      default: null,
    },
    rentPer30Days: {
      type: Number,
      required: [true, "Rent per 30 days is required"],
      min: [0, "Rent cannot be negative"],
    },
    currentMonthDays: {
      type: Number,
      required: [true, "Current month days is required"],
      min: [1, "Days must be at least 1"],
      max: [31, "Days cannot exceed 31"],
      default: 30,
    },
   
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Returned", "Overdue", "Extended"],
      default: "Active",
    },
    notes: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    extensionHistory: [
      {
        extensionDate: Date,
        previousDueDate: Date,
        newDueDate: Date,
        additionalDays: Number,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Calculate current month rent before saving
allotmentSchema.pre("save", function (next) {
  if (this.isModified("rentPer30Days") || this.isModified("currentMonthDays")) {
    this.currentMonthRent = (this.rentPer30Days / 30) * this.currentMonthDays
  }
  next()
})

// Calculate due date before saving
allotmentSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("handoverDate") || this.isModified("currentMonthDays")) {
    this.dueDate = new Date(this.handoverDate.getTime() + this.currentMonthDays * 24 * 60 * 60 * 1000)
  }
  next()
})

// Index for better performance
allotmentSchema.index({ laptopId: 1 })
allotmentSchema.index({ organizationId: 1 })
allotmentSchema.index({ status: 1 })
allotmentSchema.index({ handoverDate: 1 })
allotmentSchema.index({ dueDate: 1 })

module.exports = mongoose.model("Allotment", allotmentSchema)
