"use client"

import { useEffect } from "react"
import { useAppDispatch, useAllotments } from "../../hooks/useRedux"
import { fetchAllotmentStats } from "../../store/slices/allotmentSlice"
import { Card } from "../ui/card"
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle } from "lucide-react"

export function AllotmentStatsCard({ period = "month" }) {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAllotments()

  useEffect(() => {
    dispatch(fetchAllotmentStats({ period }))
  }, [dispatch, period])

  const statsData = [
    {
      title: "Total Allotments",
      value: stats.total || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Allotments",
      value: stats.active || 0,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Overdue Allotments",
      value: stats.overdue || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    // {
    //   title: "Monthly Revenue",
    //   value: `₹${(stats.monthlyRevenue || 0).toLocaleString()}`,
    //   icon: DollarSign,
    //   color: "text-purple-600",
    //   bgColor: "bg-purple-50",
    // },
    // {
    //   title: "Total Revenue",
    //   value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
    //   icon: TrendingUp,
    //   color: "text-indigo-600",
    //   bgColor: "bg-indigo-50",
    // },
    // {
    //   title: "Average Rent",
    //   value: `₹${(stats.averageRent || 0).toLocaleString()}`,
    //   icon: TrendingDown,
    //   color: "text-orange-600",
    //   bgColor: "bg-orange-50",
    // },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
export default AllotmentStatsCard