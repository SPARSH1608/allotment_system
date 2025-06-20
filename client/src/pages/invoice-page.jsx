"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Download, Eye, Search, Plus, Upload, FileText } from "lucide-react"
import  CreateInvoiceModal  from "../components/create-invoice-modal"
import { InvoicePreview } from "../components/invoice-preview"

const mockInvoices = [
  {
    invoiceNumber: "INV-2024-0001",
    invoiceDate: "2024-03-15",
    dueDate: "2024-04-14",
    status: "Paid",
    companyDetails: {
      name: "TechRent Solutions Pvt Ltd",
      address: "123 Business Park, Tech City, State - 123456",
      mobileNumber: "+91-9876543210",
      gstin: "29ABCDE1234F1Z5",
      bankDetails: {
        bankName: "State Bank of India",
        bankAddress: "Main Branch, Tech City",
        accountNumber: "1234567890123456",
        ifscCode: "SBIN0001234",
      },
    },
    organizationDetails: {
      name: "TechCorp Solutions",
      address: "456 Tech Street, Innovation City, State - 560001",
      contactPerson: "John Smith",
      contactEmail: "john.smith@techcorp.com",
      phoneNumber: "+91-9876543210",
      gstin: "29ABCDE1234F2Z6",
    },
    items: [
      {
        productId: "LP001",
        description: "Lenovo ThinkPad E14 - Intel i5 8GB RAM 256GB SSD",
        quantity: 2,
        rentDuration: 30,
        ratePerDay: 100,
        totalAmount: 6000,
      },
    ],
    subtotal: 6000,
    sgstRate: 9,
    sgstAmount: 540,
    cgstRate: 9,
    cgstAmount: 540,
    totalTaxAmount: 1080,
    grandTotal: 7080,
    grandTotalInWords: "Seven Thousand Eighty Rupees Only",
    declarations: [
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      "This is a computer generated invoice and does not require physical signature.",
      "Subject to jurisdiction of courts in Tech City only.",
      "Payment terms: Net 30 days from invoice date.",
    ],
    authorizedSignatory: {
      name: "Authorized Signatory",
      designation: "Manager",
    },
  },
  {
    invoiceNumber: "INV-2024-0002",
    invoiceDate: "2024-03-20",
    dueDate: "2024-04-19",
    status: "Sent",
    companyDetails: {
      name: "TechRent Solutions Pvt Ltd",
      address: "123 Business Park, Tech City, State - 123456",
      mobileNumber: "+91-9876543210",
      gstin: "29ABCDE1234F1Z5",
      bankDetails: {
        bankName: "State Bank of India",
        bankAddress: "Main Branch, Tech City",
        accountNumber: "1234567890123456",
        ifscCode: "SBIN0001234",
      },
    },
    organizationDetails: {
      name: "DataSoft Inc",
      address: "789 Data Avenue, Digital Park, State - 560002",
      contactPerson: "Sarah Johnson",
      contactEmail: "sarah.johnson@datasoft.com",
      phoneNumber: "+91-9876543211",
      gstin: "29ABCDE1234F3Z7",
    },
    items: [
      {
        productId: "LP002",
        description: "Dell Inspiron 15 - Intel i7 16GB RAM 512GB SSD",
        quantity: 1,
        rentDuration: 45,
        ratePerDay: 150,
        totalAmount: 6750,
      },
    ],
    subtotal: 6750,
    sgstRate: 9,
    sgstAmount: 607.5,
    cgstRate: 9,
    cgstAmount: 607.5,
    totalTaxAmount: 1215,
    grandTotal: 7965,
    grandTotalInWords: "Seven Thousand Nine Hundred Sixty Five Rupees Only",
    declarations: [
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      "This is a computer generated invoice and does not require physical signature.",
      "Subject to jurisdiction of courts in Tech City only.",
      "Payment terms: Net 30 days from invoice date.",
    ],
    authorizedSignatory: {
      name: "Authorized Signatory",
      designation: "Manager",
    },
  },
]

export function InvoicesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.organizationDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.organizationDetails.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setIsPreviewOpen(true)
  }

  const handleEditInvoice = () => {
    setIsPreviewOpen(false)
    setIsCreateModalOpen(true)
  }

  const handleDownloadPDF = (invoice) => {
    console.log("Downloading PDF for invoice:", invoice.invoiceNumber)
    // Implement PDF download logic
  }

  const handleSendInvoice = (invoice) => {
    console.log("Sending invoice:", invoice.invoiceNumber)
    // Implement email sending logic
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success"
      case "sent":
        return "warning"
      case "overdue":
        return "error"
      default:
        return "secondary"
    }
  }

  if (isPreviewOpen && selectedInvoice) {
    return (
      <div className="p-8">
        <InvoicePreview
          invoice={selectedInvoice}
          onEdit={handleEditInvoice}
          onDownload={() => handleDownloadPDF(selectedInvoice)}
          onSend={() => handleSendInvoice(selectedInvoice)}
        />
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
            Back to Invoices
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </div>
        </div>
        <p className="text-gray-600">Manage billing and payment tracking with GST compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{mockInvoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockInvoices.filter((inv) => inv.status === "Paid").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockInvoices.filter((inv) => inv.status === "Sent").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockInvoices.filter((inv) => inv.status === "Overdue").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search invoices..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="sent">Sent</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.invoiceNumber} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-blue-600">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.organizationDetails.name}</div>
                      <div className="text-sm text-gray-500">{invoice.organizationDetails.contactPerson}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{invoice.grandTotal.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">(incl. ₹{invoice.totalTaxAmount.toLocaleString()} tax)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleDownloadPDF(invoice)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInvoiceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}
export default InvoicesPage