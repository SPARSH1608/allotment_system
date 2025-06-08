import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { allotmentService } from "../../services/allotmentService"

// Async thunks using services
export const fetchAllotments = createAsyncThunk(
  "allotments/fetchAllotments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await allotmentService.getAllotments(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchAllotmentById = createAsyncThunk("allotments/fetchAllotmentById", async (id, { rejectWithValue }) => {
  try {
    const response = await allotmentService.getAllotmentById(id)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createAllotment = createAsyncThunk(
  "allotments/createAllotment",
  async (allotmentData, { rejectWithValue }) => {
    try {
      const response = await allotmentService.createAllotment(allotmentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const extendAllotment = createAsyncThunk(
  "allotments/extendAllotment",
  async ({ id, extensionData }, { rejectWithValue }) => {
    try {
      const response = await allotmentService.extendAllotment(id, extensionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const returnAllotment = createAsyncThunk(
  "allotments/returnAllotment",
  async ({ id, returnData }, { rejectWithValue }) => {
    try {
      const response = await allotmentService.returnAllotment(id, returnData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchOverdueAllotments = createAsyncThunk(
  "allotments/fetchOverdueAllotments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await allotmentService.getOverdueAllotments()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchAllotmentStats = createAsyncThunk("allotments/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const response = await allotmentService.getAllotmentStats()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const bulkReturnAllotments = createAsyncThunk(
  "allotments/bulkReturn",
  async ({ allotmentIds, returnData }, { rejectWithValue }) => {
    try {
      const response = await allotmentService.bulkReturnAllotments(allotmentIds, returnData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchAllotmentHistory = createAsyncThunk("allotments/fetchHistory", async (id, { rejectWithValue }) => {
  try {
    const response = await allotmentService.getAllotmentHistory(id)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  allotments: [],
  currentAllotment: null,
  overdueAllotments: [],
  allotmentHistory: [],
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
    productId: "",
    startDate: "",
    endDate: "",
  },
  sortBy: "allotmentDate",
  sortOrder: "desc",
}

const allotmentSlice = createSlice({
  name: "allotments",
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
        productId: "",
        startDate: "",
        endDate: "",
      }
    },
    setSorting: (state, action) => {
      state.sortBy = action.payload.sortBy
      state.sortOrder = action.payload.sortOrder
    },
    clearCurrentAllotment: (state) => {
      state.currentAllotment = null
      state.allotmentHistory = []
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch allotments
      .addCase(fetchAllotments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllotments.fulfilled, (state, action) => {
        state.loading = false
        state.allotments = action.payload.data
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          count: action.payload.count,
        }
      })
      .addCase(fetchAllotments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch allotment by ID
      .addCase(fetchAllotmentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllotmentById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAllotment = action.payload
      })
      .addCase(fetchAllotmentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create allotment
      .addCase(createAllotment.pending, (state) => {
        state.loading = true
      })
      .addCase(createAllotment.fulfilled, (state, action) => {
        state.loading = false
        state.allotments.unshift(action.payload)
      })
      .addCase(createAllotment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Extend allotment
      .addCase(extendAllotment.fulfilled, (state, action) => {
        const index = state.allotments.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.allotments[index] = action.payload
        }
        if (state.currentAllotment && state.currentAllotment.id === action.payload.id) {
          state.currentAllotment = action.payload
        }
      })
      .addCase(extendAllotment.rejected, (state, action) => {
        state.error = action.payload
      })
      // Return allotment
      .addCase(returnAllotment.fulfilled, (state, action) => {
        const index = state.allotments.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.allotments[index] = action.payload
        }
        if (state.currentAllotment && state.currentAllotment.id === action.payload.id) {
          state.currentAllotment = action.payload
        }
      })
      .addCase(returnAllotment.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch overdue allotments
      .addCase(fetchOverdueAllotments.fulfilled, (state, action) => {
        state.overdueAllotments = action.payload
      })
      // Fetch stats
      .addCase(fetchAllotmentStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      // Bulk return
      .addCase(bulkReturnAllotments.fulfilled, (state, action) => {
        // Update returned allotments in the state
        action.payload.forEach((returnedAllotment) => {
          const index = state.allotments.findIndex((a) => a.id === returnedAllotment.id)
          if (index !== -1) {
            state.allotments[index] = returnedAllotment
          }
        })
      })
      .addCase(bulkReturnAllotments.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch allotment history
      .addCase(fetchAllotmentHistory.fulfilled, (state, action) => {
        state.allotmentHistory = action.payload
      })
  },
})

export const { clearError, setFilters, clearFilters, setSorting, clearCurrentAllotment, setLoading } =
  allotmentSlice.actions

export default allotmentSlice.reducer
