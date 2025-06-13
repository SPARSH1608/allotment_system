import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { bulkAllotmentService } from "../../services/bulkAllotmentService"

// Async thunks
export const uploadBulkAllotments = createAsyncThunk(
  "bulkAllotment/upload",
  async ({ file, options }, { rejectWithValue }) => {
    try {
      const response = await bulkAllotmentService.uploadBulkAllotments(file, options)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Upload failed")
    }
  },
)

export const previewBulkAllotments = createAsyncThunk("bulkAllotment/preview", async (file, { rejectWithValue }) => {
  try {
    const response = await bulkAllotmentService.previewBulkAllotments(file)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Preview failed")
  }
})

export const getBulkUploadHistory = createAsyncThunk(
  "bulkAllotment/getHistory",
  async (params, { rejectWithValue }) => {
    try {
      const response = await bulkAllotmentService.getBulkUploadHistory(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch history")
    }
  },
)

export const downloadTemplate = createAsyncThunk(
  "bulkAllotment/downloadTemplate",
  async (format, { rejectWithValue }) => {
    try {
      const response = await bulkAllotmentService.downloadTemplate(format)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Download failed")
    }
  },
)

const initialState = {
  // Upload state
  isUploading: false,
  uploadProgress: 0,
  uploadResults: null,
  uploadError: null,

  // Preview state
  previewData: null,
  previewLoading: false,
  previewError: null,

  // Field mappings
  fieldMappings: {},
  customMappings: {},

  // Validation
  validationResults: null,
  validationErrors: [],

  // History
  uploadHistory: [],
  historyLoading: false,
  historyError: null,

  // Template
  templateDownloading: false,
  templateError: null,

  // UI state
  currentStep: "upload", // upload, preview, mapping, validation, processing, complete
  selectedFile: null,
  processingStats: {
    totalRows: 0,
    processedRows: 0,
    successfulRows: 0,
    failedRows: 0,
  },
}

const bulkAllotmentSlice = createSlice({
  name: "bulkAllotment",
  initialState,
  reducers: {
    // UI actions
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload
    },

    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload
    },

    setFieldMappings: (state, action) => {
      state.fieldMappings = action.payload
    },

    setCustomMappings: (state, action) => {
      state.customMappings = { ...state.customMappings, ...action.payload }
    },

    setValidationResults: (state, action) => {
      state.validationResults = action.payload
    },

    updateProcessingStats: (state, action) => {
      state.processingStats = { ...state.processingStats, ...action.payload }
    },

    clearUploadState: (state) => {
      state.isUploading = false
      state.uploadProgress = 0
      state.uploadResults = null
      state.uploadError = null
      state.previewData = null
      state.previewError = null
      state.validationResults = null
      state.validationErrors = []
      state.currentStep = "upload"
      state.selectedFile = null
      state.fieldMappings = {}
      state.customMappings = {}
      state.processingStats = {
        totalRows: 0,
        processedRows: 0,
        successfulRows: 0,
        failedRows: 0,
      }
    },

    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
  },

  extraReducers: (builder) => {
    builder
      // Upload bulk allotments
      .addCase(uploadBulkAllotments.pending, (state) => {
        state.isUploading = true
        state.uploadError = null
        state.currentStep = "processing"
      })
      .addCase(uploadBulkAllotments.fulfilled, (state, action) => {
        state.isUploading = false
        state.uploadResults = action.payload
        state.currentStep = "complete"
        state.uploadProgress = 100
      })
      .addCase(uploadBulkAllotments.rejected, (state, action) => {
        state.isUploading = false
        state.uploadError = action.payload
        state.uploadProgress = 0
      })

      // Preview bulk allotments
      .addCase(previewBulkAllotments.pending, (state) => {
        state.previewLoading = true
        state.previewError = null
      })
      .addCase(previewBulkAllotments.fulfilled, (state, action) => {
        state.previewLoading = false
        state.previewData = action.payload
        state.currentStep = "preview"
      })
      .addCase(previewBulkAllotments.rejected, (state, action) => {
        state.previewLoading = false
        state.previewError = action.payload
      })

      // Get upload history
      .addCase(getBulkUploadHistory.pending, (state) => {
        state.historyLoading = true
        state.historyError = null
      })
      .addCase(getBulkUploadHistory.fulfilled, (state, action) => {
        state.historyLoading = false
        state.uploadHistory = action.payload.data || []
      })
      .addCase(getBulkUploadHistory.rejected, (state, action) => {
        state.historyLoading = false
        state.historyError = action.payload
      })

      // Download template
      .addCase(downloadTemplate.pending, (state) => {
        state.templateDownloading = true
        state.templateError = null
      })
      .addCase(downloadTemplate.fulfilled, (state) => {
        state.templateDownloading = false
      })
      .addCase(downloadTemplate.rejected, (state, action) => {
        state.templateDownloading = false
        state.templateError = action.payload
      })
  },
})

export const {
  setCurrentStep,
  setSelectedFile,
  setFieldMappings,
  setCustomMappings,
  setValidationResults,
  updateProcessingStats,
  clearUploadState,
  setUploadProgress,
} = bulkAllotmentSlice.actions

export default bulkAllotmentSlice.reducer
