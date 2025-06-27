"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAllotments } from "../hooks/useRedux"
import {
  fetchAllotments,
  setFilters,
  clearFilters,
  selectAllotment,
  unselectAllotment,
  selectAllAllotments,
  clearSelection,
} from "../store/slices/allotmentSlice"
import { fetchOrganizations } from "../store/slices/organizationSlice"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { CreateAllotmentModal } from "../components/allotments/create-allotment-modal"
import  AllotmentStatsCard  from "../components/allotments/allotment-stats-card"
import  OverdueAllotmentsTable from "../components/allotments/overdue-allotments-table"
import  ExtendRentalModal  from "../components/extend-rental-modal"
import  MarkReturnedModal  from "../components/mark-returned-modal"
import { Search, Plus, Filter, Download, Eye, History, Upload } from "lucide-react"
import { BulkAllotmentModal } from "../components/allotments/bulk-allotment-modal"
import { Modal } from "../components/ui/modal"
import { BulkUploadHistory } from "../components/allotments/bulk-upload-history"
import { useSelector } from "react-redux"
import BulkReturnModal from "../components/bulk-return-modal"
import BulkExtendModal from "../components/bulk-extend-modal"

export function AllotmentsPage() {
  const dispatch = useAppDispatch()
  const { allotments, loading, error, pagination, filters, selectedAllotments } = useAllotments()
  const organizations = useSelector((state) => state.organizations.organizations || [])
console.log("Allotments:", allotments)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showBulkReturnModal, setShowBulkReturnModal] = useState(false)
  const [showBulkExtendModal, setShowBulkExtendModal] = useState(false)
  const [selectedAllotment, setSelectedAllotment] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  useEffect(() => {
    dispatch(fetchAllotments({ ...filters, page: 1 }))
    dispatch(fetchOrganizations())
  }, [dispatch, filters])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    dispatch(setFilters({ search: value }))
  }

  const statusMap = {
    active: "Active",
    overdue: "Overdue",
    returned: "Returned",
    cancelled: "Cancelled",
    extended: "Extended",
  }

  // Helper to get the key from the value
  const getStatusKey = (value) => {
    if (!value) return ""
    const entry = Object.entries(statusMap).find(([, v]) => v === value)
    return entry ? entry[0] : ""
  }

  const handleFilterChange = (key, value) => {
    if (key === "status") {
      dispatch(setFilters({ status: value ? statusMap[value] : "" }))
    } else {
      dispatch(setFilters({ [key]: value }))
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    dispatch(clearFilters())
  }

  const handleSelectAllotment = (id) => {
    if (selectedAllotments.includes(id)) {
      dispatch(unselectAllotment(id))
    } else {
      dispatch(selectAllotment(id))
    }
  }

  const handleSelectAll = () => {
    if (selectedAllotments.length === allotments.length) {
      dispatch(clearSelection())
    } else {
      dispatch(selectAllAllotments())
    }
  }

  const handleExtend = (allotment) => {
    setSelectedAllotment(allotment)
    setShowExtendModal(true)
  }

  const handleReturn = (allotment) => {
    setSelectedAllotment(allotment)
    setShowReturnModal(true)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: "success", label: "Active" },
      overdue: { variant: "error", label: "Overdue" },
      returned: { variant: "default", label: "Returned" },
      cancelled: { variant: "warning", label: "Cancelled" },
      extended: { variant: "info", label: "Extended" },
    }

    const config = statusConfig[status] || { variant: "default", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleBulkUploadSuccess = () => {
    setShowBulkModal(false)
    dispatch(fetchAllotments({ ...filters, page: 1 }))
  }

  const handleExportSelected = () => {
    // Implement export logic here (e.g., call an API or generate CSV)
    alert("Export selected allotments: " + selectedAllotments.join(", "))
  }

  // Get selected allotment objects
  const selectedAllotmentObjs = allotments.filter(a => selectedAllotments.includes(a._id))

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Allotments</h1>
          <p className="text-gray-600">Manage laptop allotments and track their status</p>
        </div>
        <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShowBulkModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Allotment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AllotmentStatsCard />

  

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search allotments..." className="pl-10" value={searchTerm} onChange={handleSearch} />
          </div>
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40"
              value={getStatusKey(filters.status)}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
              <option value="extended">Extended</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40"
              value={filters.organizationId}
              onChange={(e) => handleFilterChange("organizationId", e.target.value)}
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={handleClearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <Download className="w-4 h-4 mr-2" />
              Export Selected
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedAllotments.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{selectedAllotments.length} allotment(s) selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowBulkReturnModal(true)}>
                Bulk Return
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowBulkExtendModal(true)}>
                Bulk Extend
              </Button>
              <Button variant="outline" size="sm" onClick={() => dispatch(clearSelection())}>
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Allotments Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading allotments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : allotments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No allotments available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAllotments.length === allotments.length && allotments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allotment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allotments.map((allotment) => (
                  <tr key={allotment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAllotments.includes(allotment._id)}
                        onChange={() => handleSelectAllotment(allotment._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-blue-600">{allotment.laptopId?.id}</div>
                        <div className="text-sm text-gray-900">{allotment.laptopId?.model}</div>
                        <div className="text-sm text-gray-500">{allotment.laptopId?.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{allotment.organizationId?.name}</div>
                        <div className="text-sm text-gray-500">{allotment.organizationId?.contactPerson}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allotment.handoverDate ? new Date(allotment.handoverDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allotment.dueDate ? new Date(allotment.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(allotment.status?.toLowerCase())}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{allotment.rentPer30Days?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleExtend(allotment)}
                        >
                          Extend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-800"
                          onClick={() => handleReturn(allotment)}
                        >
                          Return
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * 10 + 1} to {Math.min(pagination.page * 10, pagination.total)} of{" "}
                {pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => dispatch(fetchAllotments({ ...filters, page: pagination.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => dispatch(fetchAllotments({ ...filters, page: pagination.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <CreateAllotmentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {showExtendModal && selectedAllotment && (
        <ExtendRentalModal
          isOpen={showExtendModal}
          onClose={() => {
            setShowExtendModal(false)
            setSelectedAllotment(null)
            dispatch(fetchOrganizations())
            dispatch(fetchAllotments({ ...filters, page: pagination.page }))
          }}
          allotment={selectedAllotment}
        />
      )}

      {showReturnModal && selectedAllotment && (
        <MarkReturnedModal
          isOpen={showReturnModal}
          onClose={() => {
            setShowReturnModal(false)
            setSelectedAllotment(null)
            dispatch(fetchOrganizations())
            dispatch(fetchAllotments({ ...filters, page: pagination.page }))
          }}
          allotment={selectedAllotment}
        />
      )}

      <BulkAllotmentModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      {showHistoryModal && (
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Bulk Upload History"
          size="xl"
        >
          <BulkUploadHistory />
        </Modal>
      )}

      <BulkReturnModal
        isOpen={showBulkReturnModal}
        onClose={() => setShowBulkReturnModal(false)}
        allotments={selectedAllotmentObjs}
      />
      <BulkExtendModal
        isOpen={showBulkExtendModal}
        onClose={() => setShowBulkExtendModal(false)}
        allotments={selectedAllotmentObjs}
      />
    </div>
  )
}
export default AllotmentsPage