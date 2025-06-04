const mongoose = require("mongoose")

const surrenderRecordSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Surrender record ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    laptopId: {
      type: String,
      required: [true, "Laptop ID is required"],
      ref: "Product",
    },
    allotmentId: {
      type: String,
      required: [true, "Allotment ID is required"],
      ref: "Allotment",
    },
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      ref: "Organization",
    },
    handoverDate: {
      type: Date,
      required: [true, "Handover date is required"],
    },
    surrenderDate: {
      type: Date,
      required: [true, "Surrender date is required"],
      default: Date.now,
    },
    condition: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor", "Damaged"],
      required: [true, "Condition is required"],
    },
    returnNotes: {
      type: String,
      trim: true,
    },
    totalDaysUsed: {
      type: Number,
      required: true,
    },
    totalRentPaid: {
      type: Number,
      required: true,
      min: [0, "Total rent cannot be negative"],
    },
    damageCharges: {
      type: Number,
      default: 0,
      min: [0, "Damage charges cannot be negative"],
    },
    finalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate total days used before saving
surrenderRecordSchema.pre("save", function (next) {
  if (this.isModified("handoverDate") || this.isModified("surrenderDate")) {
    const diffTime = Math.abs(this.surrenderDate - this.handoverDate)
    this.totalDaysUsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  next()
})

// Calculate final amount before saving
surrenderRecordSchema.pre("save", function (next) {
  if (this.isModified("totalRentPaid") || this.isModified("damageCharges")) {
    this.finalAmount = this.totalRentPaid + this.damageCharges
  }
  next()
})

// Index for better performance
surrenderRecordSchema.index({ laptopId: 1 })
surrenderRecordSchema.index({ allotmentId: 1 })
surrenderRecordSchema.index({ organizationId: 1 })
surrenderRecordSchema.index({ surrenderDate: 1 })

module.exports = mongoose.model("SurrenderRecord", surrenderRecordSchema)
