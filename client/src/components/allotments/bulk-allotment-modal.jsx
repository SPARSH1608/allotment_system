"use client"

import { useState, useRef } from "react"
import { Button } from "../ui/button"
import { Modal } from "../ui/modal"
import { FileSpreadsheet, CheckCircle, Download, Eye } from "lucide-react"
import { bulkAllotmentService } from "../../services/bulkAllotmentService"
import { detectFieldMappings, transformRowToAllotment, validateAllotmentData } from "../../utils/excelFieldMapper"
import * as XLSX from "xlsx"

export function BulkAllotmentModal({ isOpen, onClose, onSuccess }) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [step, setStep] = useState("upload") // upload, preview, mapping, processing, complete
  const [previewData, setPreviewData] = useState(null)
  const [mappings, setMappings] = useState({})
  const [validationResults, setValidationResults] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [uploadResults, setUploadResults] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith(".xlsx") && !selectedFile.name.toLowerCase().endsWith(".xls")) {
      alert("Please select an Excel file (.xlsx or .xls)")
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    await processFile(selectedFile)
  }

  const processFile = async (file) => {
    try {
      setProcessing(true)

      // Read Excel file
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })

      const sheetsData = {}
      const allMappings = {}

      // Process each sheet
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length > 0) {
          const headers = jsonData[0]
          const rows = jsonData.slice(1).filter((row) => row.some((cell) => cell !== undefined && cell !== ""))

          // Auto-detect field mappings
          const detectedMappings = detectFieldMappings(headers)

          sheetsData[sheetName] = {
            headers,
            rows,
            mappings: detectedMappings,
            organizationId: sheetName, // Sheet name as organization ID
          }

          allMappings[sheetName] = detectedMappings
        }
      })

      setPreviewData(sheetsData)
      setMappings(allMappings)
      setStep("preview")
    } catch (error) {
      console.error("Error processing file:", error)
      alert("Error processing file. Please check the file format.")
    } finally {
      setProcessing(false)
    }
  }

  const validateData = () => {
    const results = {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      errors: [],
      warnings: [],
      sheets: {},
    }

    Object.keys(previewData).forEach((sheetName) => {
      const sheet = previewData[sheetName]
      const sheetResults = {
        totalRows: sheet.rows.length,
        validRows: 0,
        invalidRows: 0,
        errors: [],
        data: [],
      }

      sheet.rows.forEach((row, index) => {
        const allotment = transformRowToAllotment(row, sheet.mappings, sheet.organizationId)
        const errors = validateAllotmentData(allotment)

        if (errors.length === 0) {
          sheetResults.validRows++
          sheetResults.data.push(allotment)
        } else {
          sheetResults.invalidRows++
          sheetResults.errors.push({
            row: index + 2, // +2 because of header and 0-based index
            errors,
          })
        }
      })

      results.totalRows += sheetResults.totalRows
      results.validRows += sheetResults.validRows
      results.invalidRows += sheetResults.invalidRows
      results.sheets[sheetName] = sheetResults
    })

    setValidationResults(results)
    setStep("mapping")
  }

  const processBulkUpload = async () => {
    try {
      setProcessing(true)

      // Prepare data for upload
      const uploadData = []

      Object.keys(validationResults.sheets).forEach((sheetName) => {
        const sheet = validationResults.sheets[sheetName]
        uploadData.push(...sheet.data)
      })

      // Upload to server
      const response = await bulkAllotmentService.uploadBulkAllotments(file, {
        data: uploadData,
        mappings: mappings,
      })

      setUploadResults(response.data)
      setStep("complete")

      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (error) {
      console.error("Error uploading bulk allotments:", error)
      alert("Error uploading data. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await bulkAllotmentService.downloadTemplate("xlsx")
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "bulk-allotment-template.xlsx")
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Error downloading template:", error)
    }
  }

  const resetModal = () => {
    setFile(null)
    setStep("upload")
    setPreviewData(null)
    setMappings({})
    setValidationResults(null)
    setUploadResults(null)
    setProcessing(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Allotment Upload" size="xl">
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${step === "upload" ? "text-blue-600" : step === "preview" || step === "mapping" || step === "processing" || step === "complete" ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "upload" ? "bg-blue-100 text-blue-600" : step === "preview" || step === "mapping" || step === "processing" || step === "complete" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
              >
                1
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>

            <div
              className={`w-8 h-0.5 ${step === "preview" || step === "mapping" || step === "processing" || step === "complete" ? "bg-green-600" : "bg-gray-200"}`}
            ></div>

            <div
              className={`flex items-center space-x-2 ${step === "preview" ? "text-blue-600" : step === "mapping" || step === "processing" || step === "complete" ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "preview" ? "bg-blue-100 text-blue-600" : step === "mapping" || step === "processing" || step === "complete" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
              >
                2
              </div>
              <span className="text-sm font-medium">Preview</span>
            </div>

            <div
              className={`w-8 h-0.5 ${step === "mapping" || step === "processing" || step === "complete" ? "bg-green-600" : "bg-gray-200"}`}
            ></div>

            <div
              className={`flex items-center space-x-2 ${step === "mapping" ? "text-blue-600" : step === "processing" || step === "complete" ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "mapping" ? "bg-blue-100 text-blue-600" : step === "processing" || step === "complete" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
              >
                3
              </div>
              <span className="text-sm font-medium">Validate</span>
            </div>

            <div className={`w-8 h-0.5 ${step === "complete" ? "bg-green-600" : "bg-gray-200"}`}></div>

            <div className={`flex items-center space-x-2 ${step === "complete" ? "text-green-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "complete" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
              >
                4
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Upload Step */}
        {step === "upload" && (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Excel File</h3>
              <p className="text-sm text-gray-500 mb-4">
                XLSX files up to 10MB. Single sheet or multiple sheets supported.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="bulk-file-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                Choose File
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">File Format Guidelines:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <strong>Single Sheet:</strong> All allotments in one sheet
                </li>
                <li>
                  • <strong>Multiple Sheets:</strong> Each sheet name = Organization ID
                </li>
                <li>
                  • <strong>Auto-Detection:</strong> System automatically maps columns
                </li>
                <li>
                  • <strong>Required Fields:</strong> Serial Number, Handover Date, Rent
                </li>
                <li>
                  • <strong>Optional Fields:</strong> Model, RAM, Storage, Contact Info
                </li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === "preview" && previewData && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">
                  File processed successfully! Found {Object.keys(previewData).length} sheet(s)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {Object.keys(previewData).map((sheetName) => {
                const sheet = previewData[sheetName]
                return (
                  <div key={sheetName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Sheet: {sheetName} ({sheet.rows.length} rows)
                      </h4>
                      <span className="text-sm text-gray-500">Organization ID: {sheet.organizationId}</span>
                    </div>

                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Detected Fields:</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.keys(sheet.mappings).map((field) => (
                          <div key={field} className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                            <span>
                              {field}: {sheet.mappings[field].header}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview first 3 rows */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            {sheet.headers.map((header, index) => (
                              <th key={index} className="px-2 py-1 text-left font-medium text-gray-700">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sheet.rows.slice(0, 3).map((row, index) => (
                            <tr key={index} className="border-t">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-2 py-1 text-gray-600">
                                  {cell || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {sheet.rows.length > 3 && (
                      <p className="text-xs text-gray-500 mt-2">... and {sheet.rows.length - 3} more rows</p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button type="button" onClick={validateData}>
                <Eye className="w-4 h-4 mr-2" />
                Validate Data
              </Button>
            </div>
          </div>
        )}

        {/* Validation Step */}
        {step === "mapping" && validationResults && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{validationResults.totalRows}</div>
                <div className="text-sm text-blue-800">Total Rows</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{validationResults.validRows}</div>
                <div className="text-sm text-green-800">Valid Rows</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{validationResults.invalidRows}</div>
                <div className="text-sm text-red-800">Invalid Rows</div>
              </div>
            </div>

            {validationResults.invalidRows > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-red-900">Validation Errors:</h4>
                {Object.keys(validationResults.sheets).map((sheetName) => {
                  const sheet = validationResults.sheets[sheetName]
                  if (sheet.errors.length === 0) return null

                  return (
                    <div key={sheetName} className="border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-800 mb-2">Sheet: {sheetName}</h5>
                      <div className="space-y-2">
                        {sheet.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                            <div className="text-sm font-medium text-red-800">Row {error.row}:</div>
                            <ul className="text-xs text-red-700 ml-4">
                              {error.errors.map((err, errIndex) => (
                                <li key={errIndex}>• {err}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {sheet.errors.length > 5 && (
                          <p className="text-xs text-red-600">... and {sheet.errors.length - 5} more errors</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep("preview")}>
                Back
              </Button>
              <div className="space-x-3">
                {validationResults.invalidRows > 0 && (
                  <Button type="button" variant="outline" onClick={() => setStep("upload")}>
                    Fix & Re-upload
                  </Button>
                )}
                {validationResults.validRows > 0 && (
                  <Button type="button" onClick={processBulkUpload} disabled={processing}>
                    {processing ? "Processing..." : `Upload ${validationResults.validRows} Valid Records`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && uploadResults && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Completed!</h3>
              <p className="text-gray-600">Successfully processed {uploadResults.successful || 0} allotments</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{uploadResults.successful || 0}</div>
                <div className="text-sm text-green-800">Successful</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{uploadResults.failed || 0}</div>
                <div className="text-sm text-red-800">Failed</div>
              </div>
            </div>

            {uploadResults.errors && uploadResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Processing Errors:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {uploadResults.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="button" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {processing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Processing file...</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
