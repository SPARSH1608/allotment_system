"use client"

import { useState, useEffect, useMemo } from "react"
import { useDispatch } from "react-redux"
import { createInvoice, fetchInvoices } from "../store/slices/invoiceSlice"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"
import { Select, SelectItem } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Plus, Building, User, Phone, Mail, MapPin, CreditCard, Search, X } from "lucide-react"
import { organizationService } from "../services/organizationService"
import { productService } from "../services/productService"

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
  const dispatch = useDispatch()
  const [currentStep, setCurrentStep] = useState(1)
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [organizations, setOrganizations] = useState([])
  const [products, setProducts] = useState([])
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
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
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    bankAddress: "",
    accountNumber: "",
    ifscCode: "",
  })

  // Fetch organizations and products on mount
  useEffect(() => {
    setLoadingOrgs(true)
    organizationService.getOrganizations()
      .then((res) => setOrganizations(res.data || []))
      .finally(() => setLoadingOrgs(false))

    setLoadingProducts(true)
    productService.getProducts()
      .then((res) => setProducts(res.data || []))
      .finally(() => setLoadingProducts(false))
  }, [])

  // Product search (client-side filtering)
  const filteredProducts = useMemo(() => {
    const selectedIds = formData.selectedProducts.map((p) => p.productId)
    if (!productSearchTerm) {
      return products.filter((p) => !selectedIds.includes(p.id))
    }
    const term = productSearchTerm.toLowerCase()
    return products.filter(
      (p) =>
        !selectedIds.includes(p.id) &&
        (
          (p.id && p.id.toLowerCase().includes(term)) ||
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.company && p.company.toLowerCase().includes(term))
        )
    )
  }, [products, productSearchTerm, formData.selectedProducts])

  useEffect(() => {
    calculateTotals()
  }, [formData.selectedProducts, formData.sgstRate, formData.cgstRate])

  useEffect(() => {
    if (formData.organizationId) {
      const org = organizations.find((o) => o.id === formData.organizationId)
      setSelectedOrganization(org)
    }
  }, [formData.organizationId, organizations])

  useEffect(() => {
    if (formData.companyDetails && formData.companyDetails.bankDetails) {
      setBankDetails({
        bankName: formData.companyDetails.bankDetails.bankName || "",
        bankAddress: formData.companyDetails.bankDetails.bankAddress || "",
        accountNumber: formData.companyDetails.bankDetails.accountNumber || "",
        ifscCode: formData.companyDetails.bankDetails.ifscCode || "",
      })
    }
  }, [formData.companyDetails])

  const calculateTotals = () => {
    const subtotal = formData.selectedProducts.reduce((sum, product) => {
      if (product.startDate && product.endDate) {
        const start = new Date(product.startDate)
        const end = new Date(product.endDate)
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)
        return sum + product.quantity * product.ratePerDay * days
      }
      return sum
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
          startDate: "",
          endDate: "",
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
            const selectedProduct = products.find((p) => p.id === value)
            if (selectedProduct) {
              updatedProduct.ratePerDay = selectedProduct.baseRent
            }
          }
          return updatedProduct
        }
        return product
      }),
    }))
  }

  const handleBankDetailsChange = (field, value) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }))
  }

  // Convert number to words (for preview)
  const convertNumberToWords = (amount) => {
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

  // Prefill bank details from companyDetails on mount or when companyDetails changes
  useEffect(() => {
    if (formData.companyDetails && formData.companyDetails.bankDetails) {
      setBankDetails({
        bankName: formData.companyDetails.bankDetails.bankName || "",
        bankAddress: formData.companyDetails.bankDetails.bankAddress || "",
        accountNumber: formData.companyDetails.bankDetails.accountNumber || "",
        ifscCode: formData.companyDetails.bankDetails.ifscCode || "",
      })
    }
  }, [formData.companyDetails])

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Organization & Invoice Details</h3>
              <p className="text-sm text-gray-600 mt-2">Select organization and set invoice dates</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="organizationId" className="text-sm font-medium text-gray-700">
                  Organization *
                </Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) => handleInputChange("organizationId", value)}
                  placeholder="Select Organization"
                  disabled={loadingOrgs}
                >
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id} displayText={org.name}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium text-gray-900">{org.name}</span>
                        <span className="text-xs text-gray-500">
                          {org.id} • {org.contactPerson}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700">
                  Invoice Date *
                </Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                Due Date *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className="w-full"
                required
              />
            </div>

            {selectedOrganization && (
              <Card className="border-2 border-blue-100 bg-blue-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{selectedOrganization.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedOrganization.contactEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedOrganization.contactPhone}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <span className="text-sm">{selectedOrganization.location}</span>
                      </div>
                      {selectedOrganization.gstin && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-mono">GSTIN: {selectedOrganization.gstin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Products & Services</h3>
              <p className="text-sm text-gray-600 mt-2">Add products with quantity and rental duration</p>
            </div>

            {/* Global Product Search */}
            <Card className="border-2 border-blue-100 bg-blue-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <Input
                      placeholder="Search products by ID, name, or company..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  {productSearchTerm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProductSearchTerm("")}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {productSearchTerm && (
                  <div className="mt-3 text-sm text-blue-700">
                    {`Found ${filteredProducts.length} product(s) matching "${productSearchTerm}"`}
                  </div>
                )}
                {/* Show filtered product list for selection */}
                {filteredProducts.length > 0 && (
                  <div className="mt-4 max-h-60 overflow-y-auto border rounded bg-white shadow">
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          // Add product to selectedProducts if not already added
                          if (!formData.selectedProducts.some(p => p.productId === prod.id)) {
                            setFormData(prev => ({
                              ...prev,
                              selectedProducts: [
                                ...prev.selectedProducts,
                                {
                                  productId: prod.id,
                                  quantity: 1,
                                  startDate: "",
                                  endDate: "",
                                  ratePerDay: prod.baseRent, // Set default to baseRent
                                },
                              ],
                            }))
                          }
                        }}
                      >
                        <div>
                          <div className="font-medium text-gray-900"> {prod.model}</div>
                          <div className="text-xs text-gray-500">{prod.id} • {prod.processor} • {prod.ram}GB RAM • {prod.ssd}GB SSD</div>
                        </div>
                        <Badge variant="outline">₹{prod.rentPerDay}/day</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {formData.selectedProducts.map((product, index) => (
                <Card key={index} className="border-2 border-gray-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Product #{index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Product Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Select Product *</Label>
                      <Select
                        value={product.productId}
                        onValueChange={(value) => updateProduct(index, "productId", value)}
                        placeholder="Choose a product"
                        disabled={loadingProducts}
                      >
                        {products.map((prod) => (
                          <SelectItem key={prod.id} value={prod.id} displayText={` ${prod.model}`}>
                            <div className="flex flex-col py-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">
                                  {prod.company} {prod.name}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  ₹{prod.rentPerDay}/day
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {prod.id} • {prod.processor} • {prod.ram}GB RAM • {prod.ssd}GB SSD
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Product Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => updateProduct(index, "quantity", Number.parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Start Date *</Label>
                        <Input
                          type="date"
                          value={product.startDate}
                          onChange={(e) => updateProduct(index, "startDate", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">End Date *</Label>
                        <Input
                          type="date"
                          value={product.endDate}
                          onChange={(e) => updateProduct(index, "endDate", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Rent Amount (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.ratePerDay}
                          onChange={(e) => updateProduct(index, "ratePerDay", Number.parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Total Amount</Label>
                        <div className="flex items-center h-10 px-3 bg-gray-50 border border-gray-200 rounded-md">
                          <span className="font-semibold text-green-700">
                            ₹{(() => {
                              // Calculate days between startDate and endDate (inclusive)
                              if (product.startDate && product.endDate) {
                                const start = new Date(product.startDate)
                                const end = new Date(product.endDate)
                                const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)
                                return (product.quantity * product.ratePerDay * days).toLocaleString()
                              }
                              return "0"
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Product Info */}
                    {product.productId && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {(() => {
                          const selectedProd = products.find((p) => p.id === product.productId)
                          return selectedProd ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p>
                                  <span className="font-medium">Product ID:</span> {selectedProd.id}
                                </p>
                                <p>
                                  <span className="font-medium">Company:</span> {selectedProd.company}
                                </p>
                                <p>
                                  <span className="font-medium">Model:</span> {selectedProd.name}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <span className="font-medium">Processor:</span> {selectedProd.processor}
                                </p>
                                <p>
                                  <span className="font-medium">RAM:</span> {selectedProd.ram}GB
                                </p>
                                <p>
                                  <span className="font-medium">Storage:</span> {selectedProd.ssd}GB SSD
                                </p>
                              </div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addProduct}
                className="w-full py-4 border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Product
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sgstRate" className="text-sm font-medium text-gray-700">
                  SGST Rate (%)
                </Label>
                <Input
                  id="sgstRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sgstRate}
                  onChange={(e) => handleInputChange("sgstRate", Number.parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cgstRate" className="text-sm font-medium text-gray-700">
                  CGST Rate (%)
                </Label>
                <Input
                  id="cgstRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cgstRate}
                  onChange={(e) => handleInputChange("cgstRate", Number.parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {formData.selectedProducts.length > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4 text-green-800">Invoice Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{calculations.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST ({formData.sgstRate}%):</span>
                      <span className="font-medium">₹{calculations.sgstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST ({formData.cgstRate}%):</span>
                      <span className="font-medium">₹{calculations.cgstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t-2 border-green-300 pt-3 text-green-800">
                      <span>Grand Total:</span>
                      <span>₹{calculations.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 3:
        // Bank Details Entry Step
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Bank Details</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enter or confirm the bank details for payment. These will appear on the invoice.
              </p>
            </div>
            <Card className="border-2 border-purple-100 bg-purple-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-purple-800">Bank Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={bankDetails.bankName}
                      onChange={e => handleBankDetailsChange("bankName", e.target.value)}
                      placeholder="Bank Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Address</Label>
                    <Input
                      value={bankDetails.bankAddress}
                      onChange={e => handleBankDetailsChange("bankAddress", e.target.value)}
                      placeholder="Bank Address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={bankDetails.accountNumber}
                      onChange={e => handleBankDetailsChange("accountNumber", e.target.value)}
                      placeholder="Account Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input
                      value={bankDetails.ifscCode}
                      onChange={e => handleBankDetailsChange("ifscCode", e.target.value)}
                      placeholder="IFSC Code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        // Invoice Preview Step (use bankDetails from state)
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Invoice Preview</h3>
              <p className="text-sm text-gray-600 mt-2">Review all details before creating the invoice</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Details */}
              <Card className="border-2 border-green-100 bg-green-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-green-800">From (Company Details)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold text-gray-900">{formData.companyDetails.name}</p>
                  <p className="text-sm text-gray-600">{formData.companyDetails.address}</p>
                  <p className="text-sm text-gray-600">Mobile: {formData.companyDetails.mobileNumber}</p>
                  <p className="text-sm text-gray-600 font-mono">GSTIN: {formData.companyDetails.gstin}</p>
                </CardContent>
              </Card>

              {/* Organization Details */}
              {selectedOrganization && (
                <Card className="border-2 border-blue-100 bg-blue-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-blue-800">To (Bill To)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold text-gray-900">{selectedOrganization.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrganization.address}</p>
                    <p className="text-sm text-gray-600">Contact: {selectedOrganization.contactPerson}</p>
                    <p className="text-sm text-gray-600">Email: {selectedOrganization.contactEmail}</p>
                    <p className="text-sm text-gray-600">Phone: {selectedOrganization.contactPhone}</p>
                    {selectedOrganization.gstin && (
                      <p className="text-sm text-gray-600 font-mono">GSTIN: {selectedOrganization.gstin}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Products Table */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle>Products & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-3 font-semibold">Product</th>
                        <th className="text-right p-3 font-semibold">Qty</th>
                        <th className="text-right p-3 font-semibold">Start Date</th>
                        <th className="text-right p-3 font-semibold">End Date</th>
                        <th className="text-right p-3 font-semibold">Rate/Day</th>
                        <th className="text-right p-3 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.selectedProducts.map((product, index) => {
                        const selectedProduct = products.find((p) => p.id === product.productId)
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">
                                  {selectedProduct
                                    ? ` ${selectedProduct.model}`
                                    : "Unknown Product"}
                                </div>
                                <div className="text-xs text-gray-500">{selectedProduct?.id}</div>
                              </div>
                            </td>
                            <td className="text-right p-3">{product.quantity}</td>
                            <td className="text-right p-3">{product.startDate}</td>
                            <td className="text-right p-3">{product.endDate}</td>
                            <td className="text-right p-3">₹{product.ratePerDay}</td>
                            <td className="text-right p-3 font-medium">
                              ₹{(() => {
                                if (product.startDate && product.endDate) {
                                  const start = new Date(product.startDate)
                                  const end = new Date(product.endDate)
                                  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)
                                  return (product.quantity * product.ratePerDay * days).toLocaleString()
                                }
                                return "0"
                              })()}
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
            <Card className="border-2 border-yellow-100 bg-yellow-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-yellow-800">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{calculations.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SGST ({formData.sgstRate}%):</span>
                    <span>₹{calculations.sgstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CGST ({formData.cgstRate}%):</span>
                    <span>₹{calculations.cgstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t-2 border-yellow-200 pt-3">
                    <span>Grand Total:</span>
                    <span>₹{calculations.grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-1">Amount in Words:</p>
                    <p className="text-sm text-gray-900 font-medium">{convertNumberToWords(calculations.grandTotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card className="border-2 border-purple-100 bg-purple-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-purple-800">Bank Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <span className="font-medium">Bank Name:</span> {bankDetails.bankName}
                    </p>
                    <p>
                      <span className="font-medium">Bank Address:</span> {bankDetails.bankAddress}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Account Number:</span> {bankDetails.accountNumber}
                    </p>
                    <p>
                      <span className="font-medium">IFSC Code:</span> {bankDetails.ifscCode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Additional Notes & Terms
              </Label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Additional terms and conditions..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Navigation logic: update step count and button logic
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Invoice" size="2xl">
      <form
        onSubmit={async e => {
          e.preventDefault()
          if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
            return
          }
          // Prepare invoice data for API
          const invoiceData = {
            organizationId: formData.organizationId,
            invoiceDate: formData.invoiceDate,
            dueDate: formData.dueDate,
            items: formData.selectedProducts.map((p) => ({
              productId: p.productId,
              description: (() => {
                const prod = products.find(prod => prod.id === p.productId)
                return prod
                  ? `${prod.company} ${prod.model || prod.name} - ${prod.processor} ${prod.ram}GB RAM ${prod.ssd}GB SSD`
                  : ""
              })(),
              quantity: p.quantity,
              startDate: p.startDate,
              endDate: p.endDate,
              ratePerDay: p.ratePerDay,
              totalAmount: (() => {
                if (p.startDate && p.endDate) {
                  const start = new Date(p.startDate)
                  const end = new Date(p.endDate)
                  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)
                  return p.quantity * p.ratePerDay * days
                }
                return 0
              })(),
            })),
            subtotal: calculations.subtotal,
            sgstRate: formData.sgstRate,
            sgstAmount: calculations.sgstAmount,
            cgstRate: formData.cgstRate,
            cgstAmount: calculations.cgstAmount,
            totalTaxAmount: calculations.totalTaxAmount,
            grandTotal: calculations.grandTotal,
            notes: formData.notes,
            companyDetails: {
              ...formData.companyDetails,
              bankDetails: { ...bankDetails },
            },
          }
          // Dispatch createInvoice thunk
          await dispatch(createInvoice(invoiceData))
          // Optionally refresh invoice list
          dispatch(fetchInvoices())
          // Clear the form after submission
          setFormData({
            organizationId: "",
            invoiceDate: new Date().toISOString().split("T")[0],
            dueDate: "",
            selectedProducts: [],
            sgstRate: 9,
            cgstRate: 9,
            notes: "",
            companyDetails: defaultCompanyDetails,
          })
          setCurrentStep(1)
          setBankDetails({
            bankName: "",
            bankAddress: "",
            accountNumber: "",
            ifscCode: "",
          })
          setSelectedOrganization(null)
          setCalculations({
            subtotal: 0,
            sgstAmount: 0,
            cgstAmount: 0,
            totalTaxAmount: 0,
            grandTotal: 0,
          })
          setProductSearchTerm("")
          onClose()
        }}
        className="space-y-8"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step <= currentStep ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`w-20 h-1 mx-3 transition-colors ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[600px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t-2 border-gray-100">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2"
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="px-6 py-2">
              Cancel
            </Button>
            {currentStep < 4 ? (
              <Button
                type="submit"
                disabled={
                  (currentStep === 1 && (!formData.organizationId || !formData.dueDate)) ||
                  (currentStep === 2 && formData.selectedProducts.length === 0) ||
                  (currentStep === 3 && (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode))
                }
                className="px-6 py-2"
              >
                Next
              </Button>
            ) : (
              <Button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700">
                Create Invoice
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default CreateInvoiceModal