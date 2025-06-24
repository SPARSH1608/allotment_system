"use client"

import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchInvoices, sendInvoiceEmail, markInvoicePaid } from "../store/slices/invoiceSlice"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Download, Eye, Search, Plus, Upload, FileText } from "lucide-react"
import CreateInvoiceModal from "../components/create-invoice-modal"
import { InvoicePreview } from "../components/invoice-preview"
import html2pdf from "html2pdf.js"

export function InvoicesPage() {
  const dispatch = useDispatch()
  const { invoices, loading, error } = useSelector(state => state.invoices)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const previewRef = useRef(null)

  // Ensure correct status value is sent to backend
  useEffect(() => {
    let status = statusFilter
    if (status === "all") status = ""
    // Capitalize first letter for backend if needed
    if (status) status = status.charAt(0).toUpperCase() + status.slice(1)
    dispatch(fetchInvoices({ search: searchTerm, status }))
  }, [dispatch, searchTerm, statusFilter])

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setIsPreviewOpen(true)
  }

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice); // set the invoice to edit
    setIsPreviewOpen(false);     // close preview
    setIsCreateModalOpen(true);  // open modal
  }

  // Download PDF using html2pdf.js and the previewRef
  const handleDownloadPDF = (invoice) => {
    if (previewRef.current) {
      console.log("Starting PDF generation...");
      html2pdf()
        .from(previewRef.current)
        .set({
          margin: 0.5,
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .toPdf()
        .get('html2canvas')
        .then((canvas) => {
          // Log canvas image size
          const dataUrl = canvas.toDataURL("image/png");
          const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
          console.log(`Rendered canvas image size: ~${sizeKB} KB`);
        })
        .then(function (instance) {
          // Save the PDF and log after saving
          return instance.save().then(() => {
            console.log("PDF file has been saved.");
          });
        });
    } else {
      setSelectedInvoice(invoice)
      setIsPreviewOpen(true)
    }
  }

  const handleSendInvoice = (invoice) => {
    dispatch(sendInvoiceEmail({ invoiceNumber: invoice.invoiceNumber, emailData: {/* ... */} }))
    // Optionally show notification
  }

  const handleMarkAsPaid = async (invoice) => {
    await dispatch(markInvoicePaid({ invoiceNumber: invoice.invoiceNumber, paymentData: { paymentDate: new Date() } }))
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
          ref={previewRef}
          invoice={selectedInvoice}
          onEdit={() => handleEditInvoice(selectedInvoice)}
          onDownload={(callbacks) => handleDownloadPDF(selectedInvoice, callbacks)}
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
            {/* Removed Export button */}
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </div>
        </div>
        <p className="text-gray-600">Manage billing and payment tracking with GST compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
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
                {invoices.filter((inv) => inv.status === "Paid").length}
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
                {invoices.filter((inv) => inv.status === "Overdue").length}
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
              <option value="Paid">Paid</option>
              <option value="Sent">Sent</option>
              <option value="Overdue">Overdue</option>
              <option value="Draft">Draft</option>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {/** New column header */}
                  {/** Show "Payment Date" and "Due Date" as separate columns */}
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </td>
                  {/* Payment Date column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.status === "Paid" && invoice.paymentDate
                      ? new Date(invoice.paymentDate).toLocaleDateString("en-IN")
                      : "--"}
                  </td>
                  {/* Due Date column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.status !== "Paid" && invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString("en-IN")
                      : "--"}
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
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setIsPreviewOpen(true)
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      {invoice.status !== "Paid" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleMarkAsPaid(invoice)}
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        invoice={selectedInvoice} // pass the invoice data here
      />
    </div>
  )
}
export default InvoicesPage