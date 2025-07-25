import React, { useState } from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import { BrowserRouter as Router } from "react-router-dom"
import ProductsPage from './pages/Products'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/dashboard-page'
import { LoginPage } from './pages/login-page'
import ProductDetailPage from './pages/product-detail-page'
import OrganizationsPage from './pages/organizations-page'
import InvoicesPage from './pages/invoice-page'
import SettingsPage from './pages/settings-page'
import OrganizationDetailPage from './pages/organization-detail-page'
import AllotmentsPage from './pages/allotment-page'
import Home from './pages/Home'
import { useIsAuthenticated } from './hooks/useRedux'

function PrivateRoute({ children }) {
  const isAuthenticated = useIsAuthenticated()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  const isAuthenticated = useIsAuthenticated();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      <div className="flex flex-col sm:flex-row min-h-screen bg-gray-50">
        {/* Sidebar only visible for authenticated users */}
        {isAuthenticated && (
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            className="hidden sm:block" // Hide Sidebar on mobile
          />
        )}
        <div
          className={`${
            isAuthenticated ? `main-content ${collapsed ? "collapsed" : "expanded"}` : ""
          } flex-1`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <PrivateRoute>
                  <ProductDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <PrivateRoute>
                  <OrganizationsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/organizations/:id"
              element={
                <PrivateRoute>
                  <OrganizationDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/allotments"
              element={
                <PrivateRoute>
                  <AllotmentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <PrivateRoute>
                  <InvoicesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App