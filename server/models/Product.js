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
      required: false,
      unique: false,
      trim: true,
      uppercase: true,
      default: "0000",
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      enum: [
        "Lenovo", "Dell", "HP", "Apple", "Asus", "Acer", "Microsoft", "Samsung", "MSI", "Toshiba", "Fujitsu", "LG", "Sony", "Huawei", "Other"
      ],
      trim: true,
    },
    processor: {
      type: String,
      required: [true, "Processor is required"],
      enum: [
        "I3", "I5", "I7", "I9", "Ryzen 3", "Ryzen 5", "Ryzen 7", "Ryzen 9", "M1", "M2", "M3", "Pentium", "Celeron", "Core 2 Duo", "Xeon", "Other"
      ],
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
      enum: [
        "2GB", "4GB", "6GB", "8GB", "12GB", "16GB", "20GB", "24GB", "32GB","48GB", "64GB", "128GB"
      ],
      trim: true,
    },
    ssd: {
      type: String,
      required: [true, "SSD is required"],
      enum: [
        "None", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "4TB", "8TB"
      ],
      trim: true,
    },
    hdd: {
      type: String,
      enum: [
        "None", "128GB", "256GB", "320GB", "500GB", "1TB", "2TB", "4TB"
      ],
      default: "None",
      trim: true,
    },
    windowsVersion: {
      type: String,
      required: [true, "Windows version is required"],
      enum: [
        "Win7", "Win8", "Win8.1", "Win10", "Win11", "macOS", "Ubuntu", "Fedora", "Debian", "Linux Mint", "Other", "WIN10", "Mac OS"
      ],
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
