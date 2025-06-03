"use client"

import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ArrowLeft, Edit, Upload, FileSpreadsheet, Building2 } from "lucide-react"

const AddOrganizationPage = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Organization</h1>
          <p className="text-gray-600">Create a new organization with laptops or add them later.</p>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Manual Entry</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Create organization manually and add laptops later.</p>
            <Button className="w-full">Get Started →</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Upload with XLSX</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Create organization with laptop data from XLSX file.</p>
            <Button variant="outline" className="w-full">
              Upload File →
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle>Multi-sheet XLSX</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Upload file with multiple organizations (one per sheet).</p>
            <Button variant="outline" className="w-full">
              Bulk Upload →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose an Option Above</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Select how you'd like to create your organization to get started.
        </p>
      </div>
    </div>
  )
}
export default AddOrganizationPage