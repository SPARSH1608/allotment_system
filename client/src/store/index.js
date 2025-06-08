import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import productReducer from "./slices/productSlice"
import organizationReducer from "./slices/organizationSlice"
import allotmentReducer from "./slices/allotmentSlice"
import invoiceReducer from "./slices/invoiceSlice"
import dashboardReducer from "./slices/dashboardSlice"
import uiReducer from "./slices/uiSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    organizations: organizationReducer,
    allotments: allotmentReducer,
    invoices: invoiceReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: import.meta.env.MODE !== "production",
})

export default store
