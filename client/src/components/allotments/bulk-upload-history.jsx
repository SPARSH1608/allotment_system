"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { FileSpreadsheet, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import  getBulkUploadHistory  from "../../store/slices/bulkAllotmentSlice"
import { formatDate } from "../../utils/formatters"

export function BulkUploadHistory() {
  const dispatch = useDispatch()
  const { uploadHistory, historyLoading, historyError } = useSelector((state) => state.bulkAllotment)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  useEffect(() => {
    dispatch(getBulkUploadHistory({ page, limit }))
  }, [dispatch, page, limit])

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "processing":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "partial":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      completed: "success",
      failed: "destructive",
      processing: "default",
      partial: "warning",
    }

    return <Badge variant={variants[status] || "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  if (historyLoading && uploadHistory.length === 0) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (historyError) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Error loading upload history: {historyError}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Bulk Upload History</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(getBulkUploadHistory({ page: 1, limit }))}
          disabled={historyLoading}
        >
          Refresh
        </Button>
      </div>

      {uploadHistory.length === 0 ? (
        <div className="text-center py-8">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No bulk uploads found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {uploadHistory.map((upload) => (
            <div key={upload.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{upload.fileName}</h4>
                    <p className="text-sm text-gray-500">Uploaded on {formatDate(upload.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(upload.status)}
                  {getStatusBadge(upload.status)}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{upload.totalRows || 0}</div>
                  <div className="text-xs text-gray-500">Total Rows</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{upload.successfulRows || 0}</div>
                  <div className="text-xs text-gray-500">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{upload.failedRows || 0}</div>
                  <div className="text-xs text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{upload.sheetsProcessed || 0}</div>
                  <div className="text-xs text-gray-500">Sheets</div>
                </div>
              </div>

              {upload.errors && upload.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <h5 className="text-sm font-medium text-red-800 mb-1">Errors:</h5>
                  <ul className="text-xs text-red-700 space-y-1">
                    {upload.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {upload.errors.length > 3 && <li>• ... and {upload.errors.length - 3} more errors</li>}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Processing time: {upload.processingTime || "N/A"}</div>
                <div className="flex space-x-2">
                  {upload.reportUrl && (
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      View Report
                    </Button>
                  )}
                  {upload.downloadUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {uploadHistory.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || historyLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={uploadHistory.length < limit || historyLoading}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  )
}
