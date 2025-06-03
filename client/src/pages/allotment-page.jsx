import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Search } from "lucide-react"

const allotments = [
  {
    id: 1,
    assetId: "LP001",
    model: "ThinkPad E14",
    organization: "TechCorp Solutions",
    contactPerson: "Rajesh Kumar",
    allotmentDate: "Feb 15, 2024",
    returnDate: "Mar 15, 2024",
    status: "Active",
    monthlyRent: 3000,
  },
  {
    id: 2,
    assetId: "LP002",
    model: "Inspiron 15",
    organization: "DataSoft Inc",
    contactPerson: "Priya Sharma",
    allotmentDate: "Jan 20, 2024",
    returnDate: "Feb 20, 2024",
    status: "Overdue",
    monthlyRent: 4500,
  },
  {
    id: 3,
    assetId: "LP004",
    model: "Pavilion 14",
    organization: "InnovateTech",
    contactPerson: "Amit Singh",
    allotmentDate: "Mar 1, 2024",
    returnDate: "Apr 1, 2024",
    status: "Active",
    monthlyRent: 3500,
  },
]

const AllotmentsPage = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Allotments</h1>
        <p className="text-gray-600">Track all laptop allotments and their status</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search allotments..." className="pl-10" />
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40">
              <option>All Status</option>
              <option>Active</option>
              <option>Overdue</option>
              <option>Returned</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40">
              <option>All Organizations</option>
              <option>TechCorp Solutions</option>
              <option>DataSoft Inc</option>
              <option>InnovateTech</option>
            </select>
          </div>
        </div>
      </div>

      {/* Allotments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allotment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {allotments.map((allotment) => (
                <tr key={allotment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{allotment.assetId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allotment.model}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{allotment.organization}</div>
                      <div className="text-gray-500">{allotment.contactPerson}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allotment.allotmentDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allotment.returnDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={allotment.status === "Active" ? "success" : "error"}>{allotment.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{allotment.monthlyRent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        Extend
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default AllotmentsPage