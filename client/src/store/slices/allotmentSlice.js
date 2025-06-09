import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { allotmentService } from "../../services/allotmentService"

// Async thunks for all allotment operations
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

export const updateAllotment = createAsyncThunk(
  "allotments/updateAllotment",
  async ({ id, allotmentData }, { rejectWithValue }) => {
    try {
      const response = await allotmentService.updateAllotment(id, allotmentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteAllotment = createAsyncThunk("allotments/deleteAllotment", async (id, { rejectWithValue }) => {
  try {
    await allotmentService.deleteAllotment(id)
    return id
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

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
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await allotmentService.getOverdueAllotments(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchAllotmentStats = createAsyncThunk(
  "allotments/fetchStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await allotmentService.getAllotmentStats(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchRevenueStats = createAsyncThunk(
  "allotments/fetchRevenueStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await allotmentService.getRevenueStats(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchUpcomingReturns = createAsyncThunk(
  "allotments/fetchUpcomingReturns",
  async (days = 7, { rejectWithValue }) => {
    try {
      const response = await allotmentService.getUpcomingReturns(days)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

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

export const searchAllotments = createAsyncThunk(
  "allotments/searchAllotments",
  async ({ query, params = {} }, { rejectWithValue }) => {
    try {
      const response = await allotmentService.searchAllotments(query, params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const renewAllotment = createAsyncThunk(
  "allotments/renewAllotment",
  async ({ id, renewalData }, { rejectWithValue }) => {
    try {
      const response = await allotmentService.renewAllotment(id, renewalData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const cancelAllotment = createAsyncThunk(
  "allotments/cancelAllotment",
  async ({ id, cancellationData }, { rejectWithValue }) => {
    try {
      const response = await allotmentService.cancelAllotment(id, cancellationData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchAllotmentSummary = createAsyncThunk("allotments/fetchSummary", async (_, { rejectWithValue }) => {
  try {
    const response = await allotmentService.getAllotmentSummary()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  // Data
  allotments: [],
  currentAllotment: null,
  overdueAllotments: [],
  upcomingReturns: [],
  allotmentHistory: [],
  searchResults: [],

  // Statistics
  stats: {
    total: 0,
    active: 0,
    overdue: 0,
    returned: 0,
    cancelled: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageRent: 0,
  },
  revenueStats: null,
  summary: null,

  // UI State
  loading: false,
  error: null,
  searchLoading: false,

  // Pagination
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    count: 0,
  },
  overduePagination: {
    page: 1,
    pages: 1,
    total: 0,
    count: 0,
  },

  // Filters and Search
  filters: {
    status: "",
    organizationId: "",
    productId: "",
    startDate: "",
    endDate: "",
    search: "",
    overdueDays: 0,
  },
  sortBy: "allotmentDate",
  sortOrder: "desc",

  // Selected items for bulk operations
  selectedAllotments: [],
}

const allotmentSlice = createSlice({
  name: "allotments",
  initialState,
  reducers: {
    // Error handling
    clearError: (state) => {
      state.error = null
    },

    // Filters and search
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
        search: "",
        overdueDays: 0,
      }
    },

    // Sorting
    setSorting: (state, action) => {
      state.sortBy = action.payload.sortBy
      state.sortOrder = action.payload.sortOrder
    },

    // Current allotment
    clearCurrentAllotment: (state) => {
      state.currentAllotment = null
      state.allotmentHistory = []
    },

    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload
    },

    // Selection for bulk operations
    selectAllotment: (state, action) => {
      const id = action.payload
      if (!state.selectedAllotments.includes(id)) {
        state.selectedAllotments.push(id)
      }
    },
    unselectAllotment: (state, action) => {
      const id = action.payload
      state.selectedAllotments = state.selectedAllotments.filter((selectedId) => selectedId !== id)
    },
    selectAllAllotments: (state) => {
      state.selectedAllotments = state.allotments.map((allotment) => allotment.id)
    },
    clearSelection: (state) => {
      state.selectedAllotments = []
    },

    // Search
    clearSearchResults: (state) => {
      state.searchResults = []
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
        state.stats.total += 1
        state.stats.active += 1
      })
      .addCase(createAllotment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update allotment
      .addCase(updateAllotment.fulfilled, (state, action) => {
        const index = state.allotments.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.allotments[index] = action.payload
        }
        if (state.currentAllotment && state.currentAllotment.id === action.payload.id) {
          state.currentAllotment = action.payload
        }
      })
      .addCase(updateAllotment.rejected, (state, action) => {
        state.error = action.payload
      })

      // Delete allotment
      .addCase(deleteAllotment.fulfilled, (state, action) => {
        state.allotments = state.allotments.filter((a) => a.id !== action.payload)
        state.stats.total -= 1
      })
      .addCase(deleteAllotment.rejected, (state, action) => {
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
          // Update stats
          if (action.payload.status === "returned") {
            state.stats.active -= 1
            state.stats.returned += 1
          }
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
        state.overdueAllotments = action.payload.data
        state.overduePagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          count: action.payload.count,
        }
      })

      // Fetch stats
      .addCase(fetchAllotmentStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload }
      })

      // Fetch revenue stats
      .addCase(fetchRevenueStats.fulfilled, (state, action) => {
        state.revenueStats = action.payload
      })

      // Fetch upcoming returns
      .addCase(fetchUpcomingReturns.fulfilled, (state, action) => {
        state.upcomingReturns = action.payload
      })

      // Bulk return
      .addCase(bulkReturnAllotments.fulfilled, (state, action) => {
        action.payload.forEach((returnedAllotment) => {
          const index = state.allotments.findIndex((a) => a.id === returnedAllotment.id)
          if (index !== -1) {
            state.allotments[index] = returnedAllotment
          }
        })
        state.selectedAllotments = []
      })
      .addCase(bulkReturnAllotments.rejected, (state, action) => {
        state.error = action.payload
      })

      // Fetch allotment history
      .addCase(fetchAllotmentHistory.fulfilled, (state, action) => {
        state.allotmentHistory = action.payload
      })

      // Search allotments
      .addCase(searchAllotments.pending, (state) => {
        state.searchLoading = true
      })
      .addCase(searchAllotments.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload.data
      })
      .addCase(searchAllotments.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload
      })

      // Renew allotment
      .addCase(renewAllotment.fulfilled, (state, action) => {
        const index = state.allotments.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.allotments[index] = action.payload
        }
      })

      // Cancel allotment
      .addCase(cancelAllotment.fulfilled, (state, action) => {
        const index = state.allotments.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.allotments[index] = action.payload
          // Update stats
          if (action.payload.status === "cancelled") {
            state.stats.active -= 1
            state.stats.cancelled += 1
          }
        }
      })

      // Fetch summary
      .addCase(fetchAllotmentSummary.fulfilled, (state, action) => {
        state.summary = action.payload
      })
  },
})

export const {
  clearError,
  setFilters,
  clearFilters,
  setSorting,
  clearCurrentAllotment,
  setLoading,
  selectAllotment,
  unselectAllotment,
  selectAllAllotments,
  clearSelection,
  clearSearchResults,
} = allotmentSlice.actions

export default allotmentSlice.reducer
