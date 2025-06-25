import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"
import { useAppDispatch } from "../hooks/useRedux"
import { extendAllotment } from "../store/slices/allotmentSlice"
import React from "react"
const BulkExtendModal = ({ isOpen, onClose, allotments }) => {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    extensionPeriod: "30",
    monthlyRent: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  // Set default rent if all selected have same rent
  React.useEffect(() => {
    if (allotments.length > 0) {
      const allRents = allotments.map((a) => a.rentPer30Days)
      const sameRent = allRents.every((r) => r === allRents[0])
      setFormData((prev) => ({
        ...prev,
        monthlyRent: sameRent ? allRents[0]?.toString() : "",
      }))
    }
  }, [allotments])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      for (const allotment of allotments) {
        await dispatch(
          extendAllotment({
            id: allotment._id,
            extensionData: {
              extensionDays: Number(formData.extensionPeriod),
              newRent: Number(formData.monthlyRent),
              notes: formData.notes,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Extend Allotments">
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
          <Label htmlFor="extensionPeriod">Extension Period (Days)</Label>
          <Input
            id="extensionPeriod"
            type="number"
            value={formData.extensionPeriod}
            onChange={(e) => handleInputChange("extensionPeriod", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
          <Input
            id="monthlyRent"
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Optional notes..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Extending..." : "Bulk Extend"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default BulkExtendModal