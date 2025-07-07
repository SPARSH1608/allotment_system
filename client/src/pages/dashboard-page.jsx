import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchDashboardStats,
  fetchRecentActivities,
  fetchAllotmentTrends,
  fetchOrganizationDistribution,
} from "../store/slices/dashboardSlice"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Laptop, Building2, FileText, TrendingUp, Plus, Upload, Eye, AlertTriangle } from "lucide-react"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { stats, activities, trends, distribution, loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchRecentActivities())
    dispatch(fetchAllotmentTrends())
    dispatch(fetchOrganizationDistribution())
  }, [dispatch])
  console.log("DashboardPage rendered")
  console.log("Stats:", stats)
  console.log("Activities:", activities)
  console.log("Trends:", trends)
  console.log("Distribution:", distribution)
  // Allotment Trends Chart Data
  let trendsData = null;
  if (trends && trends.allotmentTrends && trends.returnTrends) {
    // Collect all unique months from both trends
    const allMonths = [
      ...trends.allotmentTrends.map(t => `${t._id.year}-${t._id.month}`),
      ...trends.returnTrends.map(t => `${t._id.year}-${t._id.month}`)
    ];
    const uniqueMonths = Array.from(new Set(allMonths)).sort();
    const labels = uniqueMonths.map(key => {
      const [year, month] = key.split("-").map(Number);
      return new Date(year, month - 1).toLocaleString("default", { month: "short", year: "2-digit" });
    });

    const allotMap = Object.fromEntries(
      trends.allotmentTrends.map(t => [`${t._id.year}-${t._id.month}`, t.allotments])
    );
    const returnMap = Object.fromEntries(
      trends.returnTrends.map(t => [`${t._id.year}-${t._id.month}`, t.returns])
    );

    trendsData = {
      labels,
      datasets: [
        {
          label: "Allotted",
          data: uniqueMonths.map(key => allotMap[key] || 0),
          backgroundColor: "#2563eb",
        },
        {
          label: "Returned",
          data: uniqueMonths.map(key => returnMap[key] || 0),
          backgroundColor: "#22c55e",
        },
      ],
    };
  } else {
    trendsData = null;
  }

  // Organization Distribution Pie Data
  const distributionData = distribution
    ? {
      labels: distribution.map((org) => org.organizationId),
      datasets: [
        {
          data: distribution.map((org) => org.laptopCount),
          backgroundColor: [
            "#6366f1",
            "#f472b6",
            "#34d399",
            "#fbbf24",
            "#60a5fa",
            "#f87171",
            "#a78bfa",
            "#facc15",
          ],
        },
      ],
    }
    : null

  // Map stats according to your backend structure
  const totalLaptops = stats?.products?.total ?? stats?.totalLaptops ?? stats?.total ?? "--";
  const allotted = stats?.products?.allotted ?? stats?.allotted ?? "--";
  const available = stats?.products?.available ?? stats?.available ?? "--";
  const overdue = stats?.allotments?.overdue ?? stats?.overdue ?? "--";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your laptop allotment system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Laptop className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Laptops</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalLaptops}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Allotted</p>
                <p className="text-3xl font-bold text-gray-900">
                  {allotted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-gray-900">
                  {available}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {overdue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Allotment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Allotment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
              {trendsData ? (
                <Bar
                  data={trendsData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                  }}
                  height={220}
                />
              ) : (
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No trend data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organization Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
              {distributionData ? (
                <Pie
                  data={distributionData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "right" } },
                  }}
                  height={220}
                />
              ) : (
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No distribution data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities && activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div
                      className={`w-2 h-2 rounded-full ${activity.type === "allot" ? "bg-green-500" :
                          activity.type === "add_org" ? "bg-blue-500" :
                            activity.type === "return" ? "bg-yellow-500" :
                              activity.type === "overdue" ? "bg-red-500" : "bg-gray-400"
                        }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center">No recent activities</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add New Organization
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Products XLSX
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Overdue Items →
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  )
}

export default DashboardPage