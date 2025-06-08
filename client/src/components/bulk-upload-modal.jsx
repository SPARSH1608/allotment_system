import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { Modal } from "./ui/modal"
import { Upload } from "lucide-react"

const BulkUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef(null)

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
      setSelectedFile(files[0])
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      setSelectedFile(files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile)
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleChooseFile = () => {
    if (inputRef.current) inputRef.current.click()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Upload Products">
      <div className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{ cursor: "pointer" }}
          onClick={handleChooseFile}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload XLSX file</h3>
          <p className="text-sm text-gray-500 mb-4">XLSX files up to 10MB</p>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button type="button" variant="outline" className="cursor-pointer" onClick={handleChooseFile}>
            Choose File
          </Button>
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-700">{selectedFile.name}</div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Upload Options:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Single sheet with product data</li>
            <li>• Multi-sheet file (each sheet = one product type)</li>
            <li>• Required columns: Asset ID, Model, Serial Number, Company, etc.</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!selectedFile}>
            Upload & Process
          </Button>
        </div>
      </div>
    </Modal>
  )
}
export default BulkUploadModal