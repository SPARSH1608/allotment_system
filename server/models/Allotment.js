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
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Laptop ID is required"],
      ref: "Product",
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Organization ID is required"],
      ref: "Organization",
    },
    handoverDate: {
      type: Date,
      required: [true, "Handover date is required"],
    },
    dueDate: {
      type: Date,
      // not required, can be set from Excel/API
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
      default: 30,
    },
    currentMonthRent: {
      type: Number,
      min: [0, "Rent cannot be negative"],
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

// Indexes for performance
allotmentSchema.index({ laptopId: 1 })
allotmentSchema.index({ organizationId: 1 })
allotmentSchema.index({ status: 1 })
allotmentSchema.index({ handoverDate: 1 })
allotmentSchema.index({ dueDate: 1 })

module.exports = mongoose.model("Allotment", allotmentSchema)
