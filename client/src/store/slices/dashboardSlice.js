import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { dashboardService } from "../../services/dashboardService"

// Async thunks using services
export const fetchDashboardStats = createAsyncThunk("dashboard/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const response = await dashboardService.getDashboardStats()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchRecentActivities = createAsyncThunk(
  "dashboard/fetchActivities",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentActivities(limit)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchAllotmentTrends = createAsyncThunk(
  "dashboard/fetchTrends",
  async (months = 6, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getAllotmentTrends(months)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchOrganizationDistribution = createAsyncThunk(
  "dashboard/fetchDistribution",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getOrganizationDistribution()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchRevenueAnalytics = createAsyncThunk(
  "dashboard/fetchRevenue",
  async (period = "monthly", { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRevenueAnalytics(period)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchProductUtilization = createAsyncThunk(
  "dashboard/fetchUtilization",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getProductUtilization()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchPerformanceMetrics = createAsyncThunk(
  "dashboard/fetchPerformance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getPerformanceMetrics()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchAlerts = createAsyncThunk("dashboard/fetchAlerts", async (_, { rejectWithValue }) => {
  try {
    const response = await dashboardService.getAlerts()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchSystemHealth = createAsyncThunk("dashboard/fetchHealth", async (_, { rejectWithValue }) => {
  try {
    const response = await dashboardService.getSystemHealth()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  stats: null,
  activities: [],
  trends: null,
  distribution: [],
  revenue: null,
  utilization: null,
  performance: null,
  alerts: [],
  systemHealth: null,
  loading: false,
  error: null,
  refreshing: false,
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload
    },
    clearDashboardData: (state) => {
      state.stats = null
      state.activities = []
      state.trends = null
      state.distribution = []
      state.revenue = null
      state.utilization = null
      state.performance = null
      state.alerts = []
      state.systemHealth = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch activities
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.activities = action.payload
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch trends
      .addCase(fetchAllotmentTrends.fulfilled, (state, action) => {
        state.trends = action.payload
      })
      .addCase(fetchAllotmentTrends.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch distribution
      .addCase(fetchOrganizationDistribution.fulfilled, (state, action) => {
        state.distribution = action.payload
      })
      .addCase(fetchOrganizationDistribution.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch revenue analytics
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.revenue = action.payload
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch product utilization
      .addCase(fetchProductUtilization.fulfilled, (state, action) => {
        state.utilization = action.payload
      })
      .addCase(fetchProductUtilization.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch performance metrics
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.performance = action.payload
      })
      .addCase(fetchPerformanceMetrics.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch alerts
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch system health
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.systemHealth = action.payload
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearError, setRefreshing, clearDashboardData } = dashboardSlice.actions
export default dashboardSlice.reducer
