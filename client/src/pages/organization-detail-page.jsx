"use client"

import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchOrganizationById,
  clearCurrentOrganization,
  updateOrganization,
  deleteOrganization
} from "../store/slices/organizationSlice"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, Edit, Upload, Plus } from "lucide-react"
import AddOrganizationModal from "../components/add-organization-model"
import CreateInvoiceModal from "../components/create-invoice-modal"
import CreateAllotmentModal from "../components/allotments/create-allotment-modal"

const OrganizationDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentOrganization, loading, error } = useSelector(state => state.organizations)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchLaptops, setSearchLaptops] = useState("")
  const [activeTab, setActiveTab] = useState("All")
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [invoiceDefaultProducts, setInvoiceDefaultProducts] = useState([])
  const [allotmentModalOpen, setAllotmentModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchOrganizationById(id))
    return () => dispatch(clearCurrentOrganization())
  }, [dispatch, id])

  const handleDeleteOrganization = async () => {
    if (!currentOrganization?.organization?._id) {
      alert("Organization ID not found!");
      return;
    }
    if (window.confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      try {
        const resultAction = await dispatch(deleteOrganization(currentOrganization.organization._id));
        if (deleteOrganization.fulfilled.match(resultAction)) {
          navigate("/organizations");
        } else {
          alert(resultAction.error?.message || "Failed to delete organization.");
        }
      } catch (err) {
        alert("An unexpected error occurred: " + err.message);
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!currentOrganization) return null

  const { organization, allotments, stats } = currentOrganization

  // --- FILTER LOGIC START ---
  const tabOptions = [
    { label: "All", value: "All" },
    { label: "Active", value: "Active" },
    { label: "Overdue", value: "Overdue" },
  ]

  const filteredAllotments = allotments
    ? allotments.filter(a => {
        if (activeTab === "All") return true
        return a.status === activeTab
      }).filter(a =>
        searchLaptops === "" ||
        (a.laptopId?.id?.toLowerCase().includes(searchLaptops.toLowerCase()) ||
         a.laptopId?.model?.toLowerCase().includes(searchLaptops.toLowerCase()) ||
         a.laptopId?.company?.toLowerCase().includes(searchLaptops.toLowerCase()))
      )
    : []
  // --- FILTER LOGIC END ---

  const getStatusBadge = (laptop) => {
    switch (laptop.status) {
      case "Allotted":
        return <Badge variant="success">Allotted</Badge>
      case "Available":
        return <Badge variant="warning">Available</Badge>
      case "Overdue":
        return <Badge variant="error">Overdue</Badge>
      case "Active":
        return <Badge variant="success">Active</Badge>
      default:
        return <Badge>{laptop.status}</Badge>
    }
  }

  const getStatusDetails = (allotment) => {
    if (!allotment.dueDate) return null

    const due = new Date(allotment.dueDate)
    const now = new Date()
    due.setHours(0,0,0,0)
    now.setHours(0,0,0,0)
    const msInDay = 1000 * 60 * 60 * 24
    const diff = Math.floor((due - now) / msInDay)

    if (allotment.status === "Active") {
      return (
        <div className="text-xs text-gray-500">
          {diff > 0
            ? `${diff} day${diff !== 1 ? "s" : ""} left`
            : diff === 0
              ? "Due today"
              : "Overdue"}
        </div>
      )
    }
    if (allotment.status === "Overdue") {
      const overdueDays = Math.abs(diff)
      return (
        <div className="text-xs text-red-500">
          {overdueDays > 0
            ? `${overdueDays} day${overdueDays !== 1 ? "s" : ""} overdue`
            : "Due today"}
        </div>
      )
    }
    return null
  }

  // For revenue, fallback to stats if available, else calculate from allotments
  const totalRevenue =
    (stats && stats.totalRevenue && !isNaN(stats.totalRevenue))
      ? stats.totalRevenue
      : (
        allotments
          ? allotments
              .filter(a => a.status === "Active" || a.status === "Extended")
              .reduce((sum, a) => sum + (a.rentPer30Days || 0), 0)
          : 0
      )

  // Handler for Generate Invoice button
  const handleGenerateInvoice = () => {
    // Get all returned allotments for this organization
    const returnedAllotments = (allotments || []).filter(
      (a) => a.status === "Returned"
    )
    // Map to default products for invoice modal
    const defaultProducts = returnedAllotments.map((a) => ({
      productId: a.laptopId?.id,
      quantity: 1,
      startDate: a.handoverDate ? a.handoverDate.split("T")[0] : "",
      endDate: a.surrenderDate ? a.surrenderDate.split("T")[0] : "",
      ratePerDay: a.rentPer30Days || 0,
    }))
    setInvoiceDefaultProducts(defaultProducts)
    setInvoiceModalOpen(true)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
          <p className="text-gray-600">
            {organization.location} • {stats?.totalLaptops} Laptops • {stats?.overdueLaptops} Overdue
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Organization
          </Button>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload XLSX
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-800"
            onClick={handleDeleteOrganization}
          >
            Delete Organization
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Contact Person</div>
          <div className="text-lg font-semibold text-gray-900">{organization.contactPerson}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Email</div>
          <div className="text-lg font-semibold text-gray-900">{organization.contactEmail}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Phone</div>
          <div className="text-lg font-semibold text-gray-900">{organization.contactPhone}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="text-lg font-semibold text-green-600">
            ₹{totalRevenue && !isNaN(totalRevenue) ? totalRevenue.toLocaleString() : "0"}
          </div>
        </div>
      </div>

      {/* Laptop Management */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              {tabOptions.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.value
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab.label} (
                    {tab.value === "All"
                      ? allotments?.length || 0
                      : allotments?.filter(a => a.status === tab.value).length || 0
                    }
                  )
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateInvoice}
              >
                Generate Invoice
              </Button>
              <Button size="sm" onClick={() => setAllotmentModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Allotment
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <Input
              placeholder="Search laptops..."
              value={searchLaptops}
              onChange={(e) => setSearchLaptops(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        {/* Laptops Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Allotments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border text-left">Allotment ID</th>
                  <th className="px-2 py-1 border text-left">Laptop ID</th>
                  <th className="px-2 py-1 border text-left">Model</th>
                  <th className="px-2 py-1 border text-left">Company</th>
                  <th className="px-2 py-1 border text-left">Processor</th>
                  <th className="px-2 py-1 border text-left">RAM</th>
                  <th className="px-2 py-1 border text-left">SSD</th>
                  <th className="px-2 py-1 border text-left">Windows/Mac</th>
                  <th className="px-2 py-1 border text-left">Base Rent</th>
                  <th className="px-2 py-1 border text-left">Handover Date</th>
                  <th className="px-2 py-1 border text-left">Surrender Date</th>
                  <th className="px-2 py-1 border text-left">Status</th>
                  <th className="px-2 py-1 border text-left">Details</th>
                  <th className="px-2 py-1 border text-left">Current Month Rent</th>
                  <th className="px-2 py-1 border text-left">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllotments && filteredAllotments.length > 0 ? (
                  filteredAllotments.map((allotment) => (
                    <tr key={allotment._id} className="hover:bg-gray-50">
                      <td className="px-2 py-1 border font-mono">{allotment.id}</td>
                      <td className="px-2 py-1 border font-mono">{allotment.laptopId?.id}</td>
                      <td className="px-2 py-1 border">{allotment.laptopId?.model}</td>
                      <td className="px-2 py-1 border">{allotment.laptopId?.company}</td>
                      <td className="px-2 py-1 border">{allotment.laptopId?.processor}</td>
                      <td className="px-2 py-1 border">{allotment.laptopId?.ram}</td>
                      <td className="px-2 py-1 border">{allotment.laptopId?.ssd}</td>
                      <td className="px-2 py-1 border">{allotment.laptopId?.windowsVersion}</td>
                      <td className="px-2 py-1 border">₹{allotment.laptopId?.baseRent}</td>
                      <td className="px-2 py-1 border">{allotment.handoverDate ? new Date(allotment.handoverDate).toLocaleDateString() : "-"}</td>
                      <td className="px-2 py-1 border">{allotment.surrenderDate ? new Date(allotment.surrenderDate).toLocaleDateString() : "-"}</td>
                      <td className="px-2 py-1 border">
                        {getStatusBadge(allotment)}
                      </td>
                      <td className="px-2 py-1 border">{getStatusDetails(allotment)}</td>
                      <td className="px-2 py-1 border">₹{allotment.rentPer30Days ?? "-"}</td>
                      <td className="px-2 py-1 border">{allotment.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="text-center py-2 text-gray-500 text-xs">
                      No allotments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Organization Modal */}
      <AddOrganizationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (data) => {
          await dispatch(updateOrganization({ id: organization._id, organizationData: data }))
          setIsEditModalOpen(false)
          dispatch(fetchOrganizationById(id))
        }}
        loading={loading}
        defaultValues={{
          name: organization.name,
          location: organization.location,
          contactPerson: organization.contactPerson,
          contactEmail: organization.contactEmail,
          contactPhone: organization.contactPhone
        }}
      />

      {/* Create Invoice Modal */}
      {invoiceModalOpen && (
        <CreateInvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          defaultOrganizationId={organization.id}
          defaultProducts={invoiceDefaultProducts}
        />
      )}

      {/* Create Allotment Modal */}
      {allotmentModalOpen && (
        <CreateAllotmentModal
          isOpen={allotmentModalOpen}
          onClose={() => setAllotmentModalOpen(false)}
          defaultOrganizationId={organization._id}
        />
      )}
    </div>
  )
}

export default OrganizationDetailPage