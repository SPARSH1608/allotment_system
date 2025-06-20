"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Plus, Minus, Building, User, Phone, Mail, MapPin, CreditCard } from "lucide-react"

const mockOrganizations = [
  {
    id: "ORG001",
    name: "TechCorp Solutions",
    address: "456 Tech Street, Innovation City, State - 560001",
    contactPerson: "John Smith",
    contactEmail: "john.smith@techcorp.com",
    phoneNumber: "+91-9876543210",
    gstin: "29ABCDE1234F2Z6",
  },
  {
    id: "ORG002",
    name: "DataSoft Inc",
    address: "789 Data Avenue, Digital Park, State - 560002",
    contactPerson: "Sarah Johnson",
    contactEmail: "sarah.johnson@datasoft.com",
    phoneNumber: "+91-9876543211",
    gstin: "29ABCDE1234F3Z7",
  },
]

const mockProducts = [
  { id: "LP001", name: "ThinkPad E14", company: "Lenovo", processor: "Intel i5", ram: 8, ssd: 256, rentPerDay: 100 },
  { id: "LP002", name: "Inspiron 15", company: "Dell", processor: "Intel i7", ram: 16, ssd: 512, rentPerDay: 150 },
  { id: "LP003", name: "MacBook Air", company: "Apple", processor: "M1", ram: 8, ssd: 256, rentPerDay: 200 },
  { id: "LP004", name: "Pavilion 14", company: "HP", processor: "AMD Ryzen 5", ram: 8, ssd: 512, rentPerDay: 120 },
]

const defaultCompanyDetails = {
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
}

export function CreateInvoiceModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    organizationId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    selectedProducts: [],
    sgstRate: 9,
    cgstRate: 9,
    notes: "",
    companyDetails: defaultCompanyDetails,
  })

  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    sgstAmount: 0,
    cgstAmount: 0,
    totalTaxAmount: 0,
    grandTotal: 0,
  })

  useEffect(() => {
    calculateTotals()
  }, [formData.selectedProducts, formData.sgstRate, formData.cgstRate])

  useEffect(() => {
    if (formData.organizationId) {
      const org = mockOrganizations.find((o) => o.id === formData.organizationId)
      setSelectedOrganization(org)
    }
  }, [formData.organizationId])

  const calculateTotals = () => {
    const subtotal = formData.selectedProducts.reduce((sum, product) => {
      return sum + product.quantity * product.rentDuration * product.ratePerDay
    }, 0)

    const sgstAmount = (subtotal * formData.sgstRate) / 100
    const cgstAmount = (subtotal * formData.cgstRate) / 100
    const totalTaxAmount = sgstAmount + cgstAmount
    const grandTotal = subtotal + totalTaxAmount

    setCalculations({
      subtotal,
      sgstAmount,
      cgstAmount,
      totalTaxAmount,
      grandTotal,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Invoice created:", {
      ...formData,
      calculations,
      organizationDetails: selectedOrganization,
    })
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: [
        ...prev.selectedProducts,
        {
          productId: "",
          quantity: 1,
          rentDuration: 30,
          ratePerDay: 0,
        },
      ],
    }))
  }

  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((_, i) => i !== index),
    }))
  }

  const updateProduct = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((product, i) => {
        if (i === index) {
          const updatedProduct = { ...product, [field]: value }
          if (field === "productId") {
            const selectedProduct = mockProducts.find((p) => p.id === value)
            if (selectedProduct) {
              updatedProduct.ratePerDay = selectedProduct.rentPerDay
            }
          }
          return updatedProduct
        }
        return product
      }),
    }))
  }

  const convertNumberToWords = (amount) => {
    // Simplified number to words conversion
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]

    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    if (amount === 0) return "Zero Rupees Only"

    const convertHundreds = (num) => {
      let result = ""

      if (num > 99) {
        result += ones[Math.floor(num / 100)] + " Hundred "
        num %= 100
      }

      if (num > 19) {
        result += tens[Math.floor(num / 10)] + " "
        num %= 10
      }

      if (num > 0) {
        result += ones[num] + " "
      }

      return result
    }

    let rupees = Math.floor(amount)
    let result = ""

    if (rupees >= 10000000) {
      const crores = Math.floor(rupees / 10000000)
      result += convertHundreds(crores) + "Crore "
      rupees %= 10000000
    }

    if (rupees >= 100000) {
      const lakhs = Math.floor(rupees / 100000)
      result += convertHundreds(lakhs) + "Lakh "
      rupees %= 100000
    }

    if (rupees >= 1000) {
      const thousands = Math.floor(rupees / 1000)
      result += convertHundreds(thousands) + "Thousand "
      rupees %= 1000
    }

    if (rupees > 0) {
      result += convertHundreds(rupees)
    }

    result += "Rupees Only"
    return result.trim()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Organization & Invoice Details</h3>
              <p className="text-sm text-gray-600">Select organization and set invoice dates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization *</Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) => handleInputChange("organizationId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                required
              />
            </div>

            {selectedOrganization && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{selectedOrganization.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedOrganization.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{selectedOrganization.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedOrganization.address}</span>
                  </div>
                  {selectedOrganization.gstin && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>GSTIN: {selectedOrganization.gstin}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Products & Services</h3>
              <p className="text-sm text-gray-600">Add products with quantity and rental duration</p>
            </div>

            <div className="space-y-4">
              {formData.selectedProducts.map((product, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Product *</Label>
                        <Select
                          value={product.productId}
                          onValueChange={(value) => updateProduct(index, "productId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProducts.map((prod) => (
                              <SelectItem key={prod.id} value={prod.id}>
                                {prod.company} {prod.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => updateProduct(index, "quantity", Number.parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Duration (Days) *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={product.rentDuration}
                          onChange={(e) => updateProduct(index, "rentDuration", Number.parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Rate/Day</Label>
                        <Input
                          type="number"
                          value={product.ratePerDay}
                          onChange={(e) => updateProduct(index, "ratePerDay", Number.parseFloat(e.target.value))}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          ₹{(product.quantity * product.rentDuration * product.ratePerDay).toLocaleString()}
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addProduct} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                <Input
                  id="sgstRate"
                  type="number"
                  value={formData.sgstRate}
                  onChange={(e) => handleInputChange("sgstRate", Number.parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                <Input
                  id="cgstRate"
                  type="number"
                  value={formData.cgstRate}
                  onChange={(e) => handleInputChange("cgstRate", Number.parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Invoice Preview</h3>
              <p className="text-sm text-gray-600">Review all details before creating the invoice</p>
            </div>

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle>From (Company Details)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{formData.companyDetails.name}</p>
                  <p className="text-sm">{formData.companyDetails.address}</p>
                  <p className="text-sm">Mobile: {formData.companyDetails.mobileNumber}</p>
                  <p className="text-sm">GSTIN: {formData.companyDetails.gstin}</p>
                </div>
              </CardContent>
            </Card>

            {/* Organization Details */}
            {selectedOrganization && (
              <Card>
                <CardHeader>
                  <CardTitle>To (Bill To)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{selectedOrganization.name}</p>
                    <p className="text-sm">{selectedOrganization.address}</p>
                    <p className="text-sm">Contact: {selectedOrganization.contactPerson}</p>
                    <p className="text-sm">Email: {selectedOrganization.contactEmail}</p>
                    <p className="text-sm">Phone: {selectedOrganization.phoneNumber}</p>
                    {selectedOrganization.gstin && <p className="text-sm">GSTIN: {selectedOrganization.gstin}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Product</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Days</th>
                        <th className="text-right p-2">Rate/Day</th>
                        <th className="text-right p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.selectedProducts.map((product, index) => {
                        const selectedProduct = mockProducts.find((p) => p.id === product.productId)
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2">
                              {selectedProduct
                                ? `${selectedProduct.company} ${selectedProduct.name}`
                                : "Unknown Product"}
                            </td>
                            <td className="text-right p-2">{product.quantity}</td>
                            <td className="text-right p-2">{product.rentDuration}</td>
                            <td className="text-right p-2">₹{product.ratePerDay}</td>
                            <td className="text-right p-2">
                              ₹{(product.quantity * product.rentDuration * product.ratePerDay).toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculations.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST ({formData.sgstRate}%):</span>
                    <span>₹{calculations.sgstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST ({formData.cgstRate}%):</span>
                    <span>₹{calculations.cgstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Grand Total:</span>
                    <span>₹{calculations.grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium">Amount in Words:</p>
                    <p className="text-sm">{convertNumberToWords(calculations.grandTotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Bank Name:</span> {formData.companyDetails.bankDetails.bankName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Bank Address:</span> {formData.companyDetails.bankDetails.bankAddress}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Account Number:</span>{" "}
                    {formData.companyDetails.bankDetails.accountNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">IFSC Code:</span> {formData.companyDetails.bankDetails.ifscCode}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Additional terms and conditions..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Invoice" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && (!formData.organizationId || !formData.dueDate)) ||
                  (currentStep === 2 && formData.selectedProducts.length === 0)
                }
              >
                Next
              </Button>
            ) : (
              <Button type="submit">Create Invoice</Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}
export default CreateInvoiceModal