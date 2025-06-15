const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Asset ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, "Serial number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      enum: ["Lenovo", "Dell", "HP", "Apple", "Asus", "Acer", "Other"],
      trim: true,
    },
    processor: {
      type: String,
      required: [true, "Processor is required"],
      enum: ["I3", "I5", "I7", "i9", "Ryzen 3", "Ryzen 5", "Ryzen 7", "M1", "M2", "Other"],
      trim: true,
    },
    processorGen: {
      type: String,
      required: [true, "Processor generation is required"],
      trim: true,
      uppercase: true,
    },
    ram: {
      type: String,
      required: [true, "RAM is required"],
      enum: ["4GB", "8GB", "16GB", "32GB", "64GB"],
      trim: true,
    },
    ssd: {
      type: String,
      required: [true, "SSD is required"],
      enum: ["128GB", "256GB", "512GB", "1TB", "2TB"],
      trim: true,
    },
    hdd: {
      type: String,
      enum: ["500GB", "1TB", "2TB", "None"],
      default: "None",
      trim: true,
    },
    windowsVersion: {
      type: String,
      required: [true, "Windows version is required"],
      enum: ["Win10", "Win11", "macOS", "Ubuntu", "Other","WIN10" ,"Mac OS"],
      trim: true,
    },
    baseRent: {
      type: Number,
      default: 0,
      min: [0, "Base rent cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Available", "Allotted", "Maintenance", "Retired"],
      default: "Available",
    },
    currentAllotmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Allotment",
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better performance
productSchema.index({ id: 1 })
productSchema.index({ serialNumber: 1 })
productSchema.index({ status: 1 })
productSchema.index({ company: 1 })

module.exports = mongoose.model("Product", productSchema)
