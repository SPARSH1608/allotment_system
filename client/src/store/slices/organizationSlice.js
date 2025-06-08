import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { organizationService } from "../../services/organizationService"

// Async thunks using services
export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchOrganizations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await organizationService.getOrganizations(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchOrganizationById = createAsyncThunk(
  "organizations/fetchOrganizationById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await organizationService.getOrganizationById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (organizationData, { rejectWithValue }) => {
    try {
      const response = await organizationService.createOrganization(organizationData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async ({ id, organizationData }, { rejectWithValue }) => {
    try {
      const response = await organizationService.updateOrganization(id, organizationData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteOrganization = createAsyncThunk(
  "organizations/deleteOrganization",
  async (id, { rejectWithValue }) => {
    try {
      await organizationService.deleteOrganization(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchOrganizationStats = createAsyncThunk("organizations/fetchStats", async (id, { rejectWithValue }) => {
  try {
    const response = await organizationService.getOrganizationStats(id)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchOrganizationAllotments = createAsyncThunk(
  "organizations/fetchAllotments",
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const response = await organizationService.getOrganizationAllotments(id, params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const searchOrganizations = createAsyncThunk(
  "organizations/searchOrganizations",
  async (query, { rejectWithValue }) => {
    try {
      const response = await organizationService.searchOrganizations(query)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  organizations: [],
  currentOrganization: null,
  organizationStats: null,
  organizationAllotments: [],
  searchResults: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    count: 0,
  },
  filters: {
    search: "",
    status: "",
    location: "",
    type: "",
  },
  sortBy: "name",
  sortOrder: "asc",
}

const organizationSlice = createSlice({
  name: "organizations",
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
        search: "",
        status: "",
        location: "",
        type: "",
      }
    },
    setSorting: (state, action) => {
      state.sortBy = action.payload.sortBy
      state.sortOrder = action.payload.sortOrder
    },
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null
      state.organizationStats = null
      state.organizationAllotments = []
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false
        state.organizations = action.payload.data
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          count: action.payload.count,
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch organization by ID
      .addCase(fetchOrganizationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrganization = action.payload
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.loading = true
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false
        state.organizations.unshift(action.payload)
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update organization
      .addCase(updateOrganization.fulfilled, (state, action) => {
        const index = state.organizations.findIndex((o) => o.id === action.payload.id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
        if (state.currentOrganization && state.currentOrganization.id === action.payload.id) {
          state.currentOrganization = action.payload
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.error = action.payload
      })
      // Delete organization
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.organizations = state.organizations.filter((o) => o.id !== action.payload)
        if (state.currentOrganization && state.currentOrganization.id === action.payload) {
          state.currentOrganization = null
        }
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch organization stats
      .addCase(fetchOrganizationStats.fulfilled, (state, action) => {
        state.organizationStats = action.payload
      })
      // Fetch organization allotments
      .addCase(fetchOrganizationAllotments.fulfilled, (state, action) => {
        state.organizationAllotments = action.payload
      })
      // Search organizations
      .addCase(searchOrganizations.fulfilled, (state, action) => {
        state.searchResults = action.payload
      })
  },
})

export const {
  clearError,
  setFilters,
  clearFilters,
  setSorting,
  clearCurrentOrganization,
  clearSearchResults,
  setLoading,
} = organizationSlice.actions

export default organizationSlice.reducer
