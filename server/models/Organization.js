const mongoose = require("mongoose")

const organizationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Organization ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
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
      validate: {
        validator: (email) => {
          if (!email) return true // Optional field
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
        },
        message: "Please enter a valid email",
      },
    },
    contactPhone: {
      type: String,
      trim: true,
      validate: {
        validator: (phone) => {
          if (!phone) return true // Optional field
          return /^[+]?[1-9][\d]{0,15}$/.test(phone)
        },
        message: "Please enter a valid phone number",
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    totalAllotments: {
      type: Number,
      default: 0,
    },
    activeAllotments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better performance
organizationSchema.index({ id: 1 })
organizationSchema.index({ name: 1 })
organizationSchema.index({ status: 1 })

module.exports = mongoose.model("Organization", organizationSchema)
