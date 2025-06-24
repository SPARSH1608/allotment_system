import { useEffect, useState } from "react"
import { useAppDispatch, useAllotments } from "../../hooks/useRedux"
import { fetchOverdueAllotments } from "../../store/slices/allotmentSlice"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import ExtendRentalModal from "../extend-rental-modal"
import MarkReturnedModal from "../mark-returned-modal"
import { AlertTriangle, Calendar, Phone, Mail } from "lucide-react"

export function OverdueAllotmentsTable() {
  const dispatch = useAppDispatch()
  const { overdueAllotments, overduePagination, loading } = useAllotments()

  const [selectedAllotment, setSelectedAllotment] = useState(null)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 10 // Number of rows per page

  useEffect(() => {
    dispatch(fetchOverdueAllotments({ page, limit }))
  }, [dispatch, page])

  const handleExtend = (allotment) => {
    setSelectedAllotment(allotment)
    setShowExtendModal(true)
  }

  const handleReturn = (allotment) => {
    setSelectedAllotment(allotment)
    setShowReturnModal(true)
  }

  const getOverdueDays = (expectedReturnDate) => {
    const today = new Date()
    const returnDate = new Date(expectedReturnDate)
    const diffTime = today - returnDate
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Overdue Allotments</h3>
            <Badge variant="error">{overduePagination.total}</Badge>
          </div>
        </div>

        {overdueAllotments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No overdue allotments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overdue Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overdueAllotments.map((allotment) => {
                    const overdueDays = getOverdueDays(allotment.dueDate)
                    return (
                      <tr key={allotment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-blue-600">{allotment.laptopId?.id}</div>
                            <div className="text-sm text-gray-900">{allotment.laptopId?.model}</div>
                            <div className="text-sm text-gray-500">{allotment.laptopId?.company}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{allotment.organizationId?.name}</div>
                            {allotment.organizationId?.contactPerson && (
                              <div className="text-sm text-gray-500">{allotment.organizationId.contactPerson}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {allotment.organizationId?.contactPhone && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  {allotment.organizationId.contactPhone}
                                </div>
                              )}
                              {allotment.organizationId?.contactEmail && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  {allotment.organizationId.contactEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(allotment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={overdueDays > 30 ? "error" : overdueDays > 7 ? "warning" : "error"}>
                            {overdueDays} days
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{allotment.rentPer30Days?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleExtend(allotment)}
                            >
                              Extend
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-800"
                              onClick={() => handleReturn(allotment)}
                            >
                              Return
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing {(overduePagination.page - 1) * limit + 1} to{" "}
                {Math.min(overduePagination.page * limit, overduePagination.total)} of {overduePagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm px-2">
                  Page {overduePagination.page} of {overduePagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === overduePagination.pages}
                  onClick={() => setPage((p) => Math.min(overduePagination.pages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modals */}
      {showExtendModal && selectedAllotment && (
        <ExtendRentalModal
          isOpen={showExtendModal}
          onClose={() => {
            setShowExtendModal(false)
            setSelectedAllotment(null)
          }}
          allotment={selectedAllotment}
        />
      )}

      {showReturnModal && selectedAllotment && (
        <MarkReturnedModal
          isOpen={showReturnModal}
          onClose={() => {
            setShowReturnModal(false)
            setSelectedAllotment(null)
          }}
          allotment={selectedAllotment}
        />
      )}
    </>
  )
}

export default OverdueAllotmentsTable