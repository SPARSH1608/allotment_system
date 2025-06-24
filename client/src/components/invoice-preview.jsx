"use client"
import React, { forwardRef } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Download, Send, Edit, Image as ImageIcon } from "lucide-react"
import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf"

export const InvoicePreview = forwardRef(function InvoicePreview(
  { invoice, onEdit, onDownload, onSend },
  ref
) {
  if (!invoice) return null

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Download handler using html2canvas-pro and jsPDF for PDF snap
  const handleDownloadPDF = async () => {
    if (ref && ref.current) {
      console.log("Capturing preview as PDF...")
      const canvas = await html2canvas(ref.current, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      })
      // Calculate width/height for A4
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`)
      console.log("PDF file has been saved.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <h2 className="text-xl font-bold">Invoice Preview</h2>
          <p className="text-sm text-gray-600">Invoice #{invoice.invoiceNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-1" />
            Download PDF
          </Button>
          <Button size="sm" onClick={onSend}>
            <Send className="w-4 h-4 mr-1" />
            Send Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div ref={ref} className="invoice-preview-capture p-8 border border-gray-200 rounded-lg">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">INVOICE</h1>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formatDate(invoice.invoiceDate)}
              </p>
              <p>
                <span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
          <Badge
            variant={
              invoice.status === "Paid"
                ? "success"
                : invoice.status === "Sent"
                  ? "warning"
                  : invoice.status === "Overdue"
                    ? "error"
                    : "secondary"
            }
            className="text-sm px-3 py-1"
          >
            {invoice.status}
          </Badge>
        </div>

        {/* Company and Organization Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* From (Company) */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-blue-600">From:</h3>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-base">{invoice.companyDetails.name}</p>
              <p>{invoice.companyDetails.address}</p>
              <p>Mobile: {invoice.companyDetails.mobileNumber}</p>
              <p>GSTIN: {invoice.companyDetails.gstin}</p>
            </div>
          </div>

          {/* To (Organization) */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-blue-600">Bill To:</h3>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-base">{invoice.organizationDetails.name}</p>
              <p>{invoice.organizationDetails.address}</p>
              <p>Contact: {invoice.organizationDetails.contactPerson}</p>
              <p>Email: {invoice.organizationDetails.contactEmail}</p>
              <p>Phone: {invoice.organizationDetails.contactPhone}</p>
              {invoice.organizationDetails.gstin && <p>GSTIN: {invoice.organizationDetails.gstin}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 text-blue-600">Products & Services</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium">S.No.</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium">Product ID</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium">Description</th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium">Qty</th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium">Duration (Days)</th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium">Rate/Day</th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium">{item.productId}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-center">{item.rentDuration}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-right">
                      {formatCurrency(item.ratePerDay)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-md">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-right font-medium">Subtotal:</td>
                  <td className="py-2 text-right pl-8">{formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-right font-medium">SGST ({invoice.sgstRate}%):</td>
                  <td className="py-2 text-right pl-8">{formatCurrency(invoice.sgstAmount)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-right font-medium">CGST ({invoice.cgstRate}%):</td>
                  <td className="py-2 text-right pl-8">{formatCurrency(invoice.cgstAmount)}</td>
                </tr>
                <tr className="border-t-2 border-gray-300">
                  <td className="py-3 text-right font-bold text-lg">Grand Total:</td>
                  <td className="py-3 text-right pl-8 font-bold text-lg">{formatCurrency(invoice.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-1">Amount in Words:</p>
          <p className="text-sm font-semibold">{invoice.grandTotalInWords}</p>
        </div>

        {/* Bank Details */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3 text-blue-600">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <span className="font-medium">Bank Name:</span> {invoice.companyDetails.bankDetails.bankName}
              </p>
              <p>
                <span className="font-medium">Bank Address:</span> {invoice.companyDetails.bankDetails.bankAddress}
              </p>
            </div>
            <div>
              <p>
                <span className="font-medium">Account Number:</span> {invoice.companyDetails.bankDetails.accountNumber}
              </p>
              <p>
                <span className="font-medium">IFSC Code:</span> {invoice.companyDetails.bankDetails.ifscCode}
              </p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3 text-blue-600">Terms & Conditions</h3>
          <div className="text-sm space-y-1">
            {invoice.declarations.map((declaration, index) => (
              <p key={index}>
                {index + 1}. {declaration}
              </p>
            ))}
          </div>
          {invoice.notes && (
            <div className="mt-4">
              <p className="font-medium">Additional Notes:</p>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Signature */}
        <div className="flex justify-end">
          <div className="text-center">
            <div className="w-48 border-t border-gray-400 pt-2">
              <p className="text-sm font-medium">{invoice.authorizedSignatory.name}</p>
              <p className="text-xs text-gray-600">{invoice.authorizedSignatory.designation}</p>
              <p className="text-xs text-gray-600">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
