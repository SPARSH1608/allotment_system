import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"
import { useAppDispatch } from "../hooks/useRedux"
import { returnAllotment } from "../store/slices/allotmentSlice"

const BulkReturnModal = ({ isOpen, onClose, allotments }) => {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split("T")[0],
    condition: "Excellent",
    returnNotes: "",
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      for (const allotment of allotments) {
        await dispatch(
          returnAllotment({
            id: allotment._id,
            returnData: {
              returnDate: new Date(formData.returnDate).toISOString(),
              condition: formData.condition,
              returnNotes: formData.returnNotes,
            },
          })
        ).unwrap()
      }
      onClose()
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Return Allotments">
      <div className="mb-4">
        <div className="font-semibold mb-2">Selected Allotments:</div>
        <ul className="list-disc pl-5 text-sm mb-4 max-h-32 overflow-auto">
          {allotments.map((a) => (
            <li key={a._id}>
              {a.laptopId?.id} - {a.laptopId?.model} ({a.organizationId?.name})
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="returnDate">Return Date</Label>
          <Input
            id="returnDate"
            type="date"
            value={formData.returnDate}
            onChange={(e) => handleInputChange("returnDate", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <select
            id="condition"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.condition}
            onChange={(e) => handleInputChange("condition", e.target.value)}
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="returnNotes">Return Notes</Label>
          <textarea
            id="returnNotes"
            rows={3}
            placeholder="Any notes about the return..."
            value={formData.returnNotes}
            onChange={(e) => handleInputChange("returnNotes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? "Returning..." : "Bulk Return"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default BulkReturnModal