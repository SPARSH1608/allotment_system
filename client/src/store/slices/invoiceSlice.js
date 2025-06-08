import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { invoiceService } from "../../services/invoiceService"

// Async thunks using services
export const fetchInvoices = createAsyncThunk("invoices/fetchInvoices", async (params = {}, { rejectWithValue }) => {
  try {
    const response = await invoiceService.getInvoices(params)
    return response
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchInvoiceByNumber = createAsyncThunk(
  "invoices/fetchInvoiceByNumber",
  async (invoiceNumber, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoiceByNumber(invoiceNumber)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const createInvoice = createAsyncThunk("invoices/createInvoice", async (invoiceData, { rejectWithValue }) => {
  try {
    const response = await invoiceService.createInvoice(invoiceData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateInvoice = createAsyncThunk(
  "invoices/updateInvoice",
  async ({ invoiceNumber, invoiceData }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.updateInvoice(invoiceNumber, invoiceData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteInvoice = createAsyncThunk("invoices/deleteInvoice", async (invoiceNumber, { rejectWithValue }) => {
  try {
    await invoiceService.deleteInvoice(invoiceNumber)
    return invoiceNumber
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const markInvoicePaid = createAsyncThunk(
  "invoices/markInvoicePaid",
  async ({ invoiceNumber, paymentData }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.markInvoicePaid(invoiceNumber, paymentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchInvoiceStats = createAsyncThunk("invoices/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const response = await invoiceService.getInvoiceStats()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const generateInvoicePDF = createAsyncThunk(
  "invoices/generatePDF",
  async (invoiceNumber, { rejectWithValue }) => {
    try {
      const response = await invoiceService.generateInvoicePDF(invoiceNumber)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const sendInvoiceEmail = createAsyncThunk(
  "invoices/sendEmail",
  async ({ invoiceNumber, emailData }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.sendInvoiceEmail(invoiceNumber, emailData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchOverdueInvoices = createAsyncThunk("invoices/fetchOverdue", async (_, { rejectWithValue }) => {
  try {
    const response = await invoiceService.getOverdueInvoices()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const bulkCreateInvoices = createAsyncThunk("invoices/bulkCreate", async (invoicesData, { rejectWithValue }) => {
  try {
    const response = await invoiceService.bulkCreateInvoices(invoicesData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  invoices: [],
  currentInvoice: null,
  overdueInvoices: [],
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    count: 0,
  },
  filters: {
    status: "",
    organizationId: "",
    search: "",
    startDate: "",
    endDate: "",
  },
  sortBy: "createdAt",
  sortOrder: "desc",
}

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: "",
        organizationId: "",
        search: "",
        startDate: "",
        endDate: "",
      }
    },
    setSorting: (state, action) => {
      state.sortBy = action.payload.sortBy
      state.sortOrder = action.payload.sortOrder
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload.data
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          count: action.payload.count,
        }
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch invoice by number
      .addCase(fetchInvoiceByNumber.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoiceByNumber.fulfilled, (state, action) => {
        state.loading = false
        state.currentInvoice = action.payload
      })
      .addCase(fetchInvoiceByNumber.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false
        state.invoices.unshift(action.payload)
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update invoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex((i) => i.invoiceNumber === action.payload.invoiceNumber)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
        if (state.currentInvoice && state.currentInvoice.invoiceNumber === action.payload.invoiceNumber) {
          state.currentInvoice = action.payload
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.error = action.payload
      })
      // Delete invoice
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter((i) => i.invoiceNumber !== action.payload)
        if (state.currentInvoice && state.currentInvoice.invoiceNumber === action.payload) {
          state.currentInvoice = null
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.error = action.payload
      })
      // Mark invoice as paid
      .addCase(markInvoicePaid.fulfilled, (state, action) => {
        const index = state.invoices.findIndex((i) => i.invoiceNumber === action.payload.invoiceNumber)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
        if (state.currentInvoice && state.currentInvoice.invoiceNumber === action.payload.invoiceNumber) {
          state.currentInvoice = action.payload
        }
      })
      .addCase(markInvoicePaid.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch stats
      .addCase(fetchInvoiceStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      // Generate PDF
      .addCase(generateInvoicePDF.rejected, (state, action) => {
        state.error = action.payload
      })
      // Send email
      .addCase(sendInvoiceEmail.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch overdue invoices
      .addCase(fetchOverdueInvoices.fulfilled, (state, action) => {
        state.overdueInvoices = action.payload
      })
      // Bulk create invoices
      .addCase(bulkCreateInvoices.fulfilled, (state, action) => {
        state.invoices = [...action.payload, ...state.invoices]
      })
      .addCase(bulkCreateInvoices.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, clearFilters, setSorting, clearCurrentInvoice, setLoading } =
  invoiceSlice.actions

export default invoiceSlice.reducer
