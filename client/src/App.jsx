import React from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
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
import AddOrganizationPage from './pages/add-organization-page'
import AllotmentsPage from './pages/allotment-page'

function App() {

  return (
    <Router>
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
        
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/organizations/detail" element={<OrganizationDetailPage />} />
          <Route path="/organizations/add" element={<AddOrganizationPage />} />
          <Route path="/allotments" element={<AllotmentsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  </Router>
  )
}

export default App
