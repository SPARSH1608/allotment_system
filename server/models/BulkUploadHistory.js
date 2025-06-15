const mongoose = require("mongoose")

const bulkUploadHistorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    uploadType: {
      type: String,
      enum: ["allotments", "products", "organizations"],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
  
    status: {
      type: String,
      enum: ["processing", "completed", "failed", "cancelled"],
      default: "processing",
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    successfulRecords: {
      type: Number,
      default: 0,
    },
    failedRecords: {
      type: Number,
      default: 0,
    },
    skippedRecords: {
      type: Number,
      default: 0,
    },
    processingTime: {
      type: Number, // in milliseconds
      default: 0,
    },
    sheets: [
      {
        sheetName: String,
        organizationId: String,
        totalRows: Number,
        successfulRows: Number,
        failedRows: Number,
        errors: [
          {
            row: Number,
            field: String,
            value: String,
            error: String,
          },
        ],
      },
    ],
    fieldMappings: {
      type: Map,
      of: String,
    },
    validationResults: {
      requiredFieldsCheck: Boolean,
      formatValidation: Boolean,
      businessRuleValidation: Boolean,
      duplicateCheck: Boolean,
    },
    errors: [
      {
        type: {
          type: String,
          enum: ["validation", "processing", "system"],
        },
        message: String,
        details: mongoose.Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    summary: {
      organizationsProcessed: Number,
      laptopsAllotted: Number,
      totalRentValue: Number,
      averageProcessingTimePerRecord: Number,
    },
    downloadUrls: {
      errorReport: String,
      successReport: String,
      originalFile: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better performance
bulkUploadHistorySchema.index({ uploadedBy: 1 })
bulkUploadHistorySchema.index({ status: 1 })
bulkUploadHistorySchema.index({ uploadType: 1 })
bulkUploadHistorySchema.index({ createdAt: -1 })

module.exports = mongoose.model("BulkUploadHistory", bulkUploadHistorySchema)
