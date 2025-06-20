"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchOrganizationById, clearCurrentOrganization } from "../store/slices/organizationSlice"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, Edit, Upload, Plus } from "lucide-react"

const OrganizationDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentOrganization, loading, error } = useSelector(state => state.organizations)
  const [searchLaptops, setSearchLaptops] = useState("")
  const [activeTab, setActiveTab] = useState("All")
console.log("Current Organization:", currentOrganization)
  useEffect(() => {
    dispatch(fetchOrganizationById(id))
    return () => dispatch(clearCurrentOrganization())
  }, [dispatch, id])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!currentOrganization) return null

  const { organization, allotments, stats } = currentOrganization
console.log("Organization Data:", organization)
console.log("Allotments Data:", allotments)
  const getStatusBadge = (laptop) => {
    switch (laptop.status) {
      case "Allotted":
        return <Badge variant="success">Allotted</Badge>
      case "Available":
        return <Badge variant="warning">Available</Badge>
      case "Overdue":
        return <Badge variant="error">Overdue</Badge>
      default:
        return <Badge>{laptop.status}</Badge>
    }
  }

  const getStatusDetails = (laptop) => {
    if (laptop.status === "Allotted") {
      return <div className="text-xs text-gray-500">{laptop.daysLeft} days left</div>
    }
    if (laptop.status === "Overdue") {
      return <div className="text-xs text-red-500">{laptop.daysOverdue} days overdue</div>
    }
    return null
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
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Organization
          </Button>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload XLSX
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
          <div className="te
          xt-sm font-medium text-gray-500">Phone</div>
          <div className="text-lg font-semibold text-gray-900">{organization.contactPhone}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="text-lg font-semibold text-green-600">₹{stats.totalRevenue && !isNaN(stats.totalRevenue) ? stats.totalRevenue.toLocaleString() : "0"}</div>
        </div>
      </div>

      {/* Laptop Management */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              {["All", "Allotted", "Available"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab} (
                  {tab === "All"
                    ? stats.totalLaptops
                    : tab === "Allotted"
                      ? stats.activeLaptops
                      : stats.totalLaptops - stats.activeLaptops}
                  )
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                Generate Invoice
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Laptop
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
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Allotment ID</th>
                <th className="px-3 py-2 border">Laptop ID</th>
                <th className="px-3 py-2 border">Model</th>
                <th className="px-3 py-2 border">Company</th>
                <th className="px-3 py-2 border">Processor</th>
                <th className="px-3 py-2 border">RAM</th>
                <th className="px-3 py-2 border">SSD</th>
                <th className="px-3 py-2 border">Windows/Mac</th>
                <th className="px-3 py-2 border">Base Rent</th>
                <th className="px-3 py-2 border">Handover Date</th>
                <th className="px-3 py-2 border">Surrender Date</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Current Month Rent</th>
                <th className="px-3 py-2 border">Location</th>
              </tr>
            </thead>
            <tbody>
              {allotments && allotments.length > 0 ? (
                allotments.map((allotment) => (
                  <tr key={allotment._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border font-mono">{allotment.id}</td>
                    <td className="px-3 py-2 border font-mono">{allotment.laptopId?.id}</td>
                    <td className="px-3 py-2 border">{allotment.laptopId?.model}</td>
                    <td className="px-3 py-2 border">{allotment.laptopId?.company}</td>
                    <td className="px-3 py-2 border">{allotment.laptopId?.processor}</td>
                    <td className="px-3 py-2 border">{allotment.laptopId?.ram}</td>
                    <td className="px-3 py-2 border">{allotment.laptopId?.ssd}</td>
                    <td className="px-3 py-2 border">{allotment.laptopId?.windowsVersion}</td>
                    <td className="px-3 py-2 border">₹{allotment.laptopId?.baseRent}</td>
                    <td className="px-3 py-2 border">{allotment.handoverDate ? new Date(allotment.handoverDate).toLocaleDateString() : "-"}</td>
                    <td className="px-3 py-2 border">{allotment.surrenderDate ? new Date(allotment.surrenderDate).toLocaleDateString() : "-"}</td>
                    <td className="px-3 py-2 border">
                      <Badge variant={allotment.status === "Active" ? "success" : "secondary"}>
                        {allotment.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 border">₹{allotment.rentPer30Days ?? "-"}</td>
                    <td className="px-3 py-2 border">{allotment.location}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="text-center py-4 text-gray-500">
                    No allotments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    
      </div>
    </div>
  )
}
export default OrganizationDetailPage