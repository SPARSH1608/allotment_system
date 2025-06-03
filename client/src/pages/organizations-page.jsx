"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Plus, Search, Upload } from "lucide-react"
import  AddOrganizationModal  from "../components/add-organization-model"
import  BulkUploadModal  from "../components/bulk-upload-modal"
import { Link } from "react-router-dom"

const organizations = [
  {
    id: 1,
    name: "TechCorp Solutions",
    initials: "TC",
    location: "Noida, UP",
    contact: "Rajesh Kumar",
    email: "rajesh@techcorp.com",
    phone: "+91 98765 43210",
    totalLaptops: 45,
    activeLaptops: 42,
    overdue: 3,
    status: "Active",
  },
  {
    id: 2,
    name: "DataSoft Inc",
    initials: "DS",
    location: "Gurgaon, HR",
    contact: "Priya Sharma",
    email: "priya@datasoft.com",
    phone: "+91 87654 32109",
    totalLaptops: 32,
    activeLaptops: 30,
    overdue: 2,
    status: "Active",
  },
  {
    id: 3,
    name: "InnovateTech",
    initials: "IT",
    location: "Delhi, DL",
    contact: "Amit Singh",
    email: "amit@innovatetech.com",
    phone: "+91 76543 21098",
    totalLaptops: 28,
    activeLaptops: 25,
    overdue: 3,
    status: "Active",
  },
]

const OrganizationsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Bulk Upload
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Organization
            </Button>
          </div>
        </div>
        <p className="text-gray-600">Manage all your client organizations and their rental history</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40">
              <option>All Locations</option>
              <option>Noida, UP</option>
              <option>Gurgaon, HR</option>
              <option>Delhi, DL</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{org.initials}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <p className="text-sm text-gray-500">{org.location}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Contact Person:</span>
                    <div className="font-medium">{org.contact}</div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{org.email}</div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium">{org.phone}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-center pt-3 border-t border-gray-200">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{org.totalLaptops}</div>
                    <div className="text-xs text-gray-500">Total Laptops</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{org.activeLaptops}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{org.overdue}</div>
                    <div className="text-xs text-gray-500">Overdue</div>
                  </div>
                </div>

                <div className="pt-3">
                  <Link to="/organizations/detail">
                    <Button variant="outline" className="w-full">
                      Generate Invoice
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-gray-700">Showing 1 to 3 of 12 organizations</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-600 text-white">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      <AddOrganizationModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <BulkUploadModal isOpen={isBulkUploadOpen} onClose={() => setIsBulkUploadOpen(false)} />
    </div>
  )
}
export default OrganizationsPage