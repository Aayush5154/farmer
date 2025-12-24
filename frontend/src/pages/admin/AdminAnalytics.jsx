import { useEffect, useState } from "react"
import api from "../../api/axios"
import Loader from "../../components/Loader"
import toast from "react-hot-toast"

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.get("/analytics/admin")
        setStats(res.data.data)
      } catch (err) {
        console.error("Admin analytics fetch failed", err)
        toast.error("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) return <Loader />

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-500">Analytics data is not available at the moment.</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate percentages for the progress indicators
  const total = stats.totalClaims || 1
  const pendingPercent = Math.round((stats.pending / total) * 100)
  const approvedPercent = Math.round((stats.approved / total) * 100)
  const rejectedPercent = Math.round((stats.rejected / total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-50 to-teal-100 rounded-full translate-y-16 -translate-x-16 opacity-40"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-1">Monitor claim statistics and performance metrics</p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Claims" 
            value={stats.totalClaims} 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="blue"
            subtitle="All submitted claims"
          />
          <StatCard 
            title="Pending Review" 
            value={stats.pending}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="amber"
            subtitle="Awaiting decision"
            percentage={pendingPercent}
          />
          <StatCard 
            title="Approved" 
            value={stats.approved}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="emerald"
            subtitle="Successfully processed"
            percentage={approvedPercent}
          />
          <StatCard 
            title="Rejected" 
            value={stats.rejected}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="red"
            subtitle="Declined claims"
            percentage={rejectedPercent}
          />
        </div>

        {/* Distribution & Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Claims Distribution */}
          <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Claims Distribution</h2>
                  <p className="text-sm text-gray-500">Breakdown by status</p>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-6">
              <DistributionBar 
                label="Pending" 
                value={stats.pending} 
                total={total} 
                color="amber" 
              />
              <DistributionBar 
                label="Approved" 
                value={stats.approved} 
                total={total} 
                color="emerald" 
              />
              <DistributionBar 
                label="Rejected" 
                value={stats.rejected} 
                total={total} 
                color="red" 
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-sm text-gray-600">Pending ({pendingPercent}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-sm text-gray-600">Approved ({approvedPercent}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">Rejected ({rejectedPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 lg:p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>

              <h3 className="text-xl font-bold mb-2">Performance Overview</h3>
              <p className="text-indigo-200 text-sm mb-6">Key metrics at a glance</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <span className="text-indigo-100 text-sm">Approval Rate</span>
                  <span className="font-bold text-lg">{approvedPercent}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <span className="text-indigo-100 text-sm">Rejection Rate</span>
                  <span className="font-bold text-lg">{rejectedPercent}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <span className="text-indigo-100 text-sm">Processing Queue</span>
                  <span className="font-bold text-lg">{stats.pending}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2 text-indigo-200 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Data updated in real-time
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Efficiency Metric */}
          <MetricCard 
            title="Processing Efficiency"
            value={`${100 - pendingPercent}%`}
            description="Claims processed out of total"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            color="purple"
            trend="up"
          />

          {/* Success Rate */}
          <MetricCard 
            title="Success Rate"
            value={`${stats.totalClaims > 0 ? Math.round((stats.approved / (stats.approved + stats.rejected || 1)) * 100) : 0}%`}
            description="Approved vs rejected ratio"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            color="emerald"
            trend="up"
          />

          {/* Pending Workload */}
          <MetricCard 
            title="Pending Workload"
            value={stats.pending}
            description="Claims requiring attention"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            color="amber"
            trend={stats.pending > 5 ? "warning" : "neutral"}
          />
        </div>

        {/* Activity Summary */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Summary</h2>
              <p className="text-sm text-gray-500">Quick overview of system status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryItem 
              label="Total Submissions"
              value={stats.totalClaims}
              icon="📄"
            />
            <SummaryItem 
              label="Awaiting Review"
              value={stats.pending}
              icon="⏳"
              highlight={stats.pending > 0}
            />
            <SummaryItem 
              label="Completed Today"
              value={stats.approved + stats.rejected}
              icon="✅"
            />
            <SummaryItem 
              label="System Health"
              value="Operational"
              icon="🟢"
              isStatus
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, subtitle, percentage }) {
  const colorMap = {
    blue: {
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      shadow: "shadow-blue-100",
      iconBg: "bg-blue-100",
      progressBg: "bg-blue-200",
      progressFill: "bg-blue-500",
    },
    amber: {
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      shadow: "shadow-amber-100",
      iconBg: "bg-amber-100",
      progressBg: "bg-amber-200",
      progressFill: "bg-amber-500",
    },
    emerald: {
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      shadow: "shadow-emerald-100",
      iconBg: "bg-emerald-100",
      progressBg: "bg-emerald-200",
      progressFill: "bg-emerald-500",
    },
    red: {
      gradient: "from-red-500 to-rose-600",
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      shadow: "shadow-red-100",
      iconBg: "bg-red-100",
      progressBg: "bg-red-200",
      progressFill: "bg-red-500",
    },
  }

  const colors = colorMap[color]

  return (
    <div className={`group relative overflow-hidden bg-white p-6 rounded-2xl border ${colors.border} shadow-lg hover:shadow-xl ${colors.shadow} transition-all duration-300 hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:scale-125 transition-transform duration-500`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg text-white`}>
            {icon}
          </div>
          {percentage !== undefined && (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}>
              {percentage}%
            </span>
          )}
        </div>
        
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className={`text-4xl font-bold mt-1 ${colors.text}`}>{value}</p>
        
        {subtitle && (
          <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
        )}

        {percentage !== undefined && (
          <div className="mt-4">
            <div className={`h-1.5 ${colors.progressBg} rounded-full overflow-hidden`}>
              <div 
                className={`h-full ${colors.progressFill} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DistributionBar({ label, value, total, color }) {
  const percentage = Math.round((value / total) * 100)
  
  const colorMap = {
    amber: {
      bg: "bg-amber-100",
      fill: "bg-gradient-to-r from-amber-400 to-orange-500",
      text: "text-amber-600",
    },
    emerald: {
      bg: "bg-emerald-100",
      fill: "bg-gradient-to-r from-emerald-400 to-teal-500",
      text: "text-emerald-600",
    },
    red: {
      bg: "bg-red-100",
      fill: "bg-gradient-to-r from-red-400 to-rose-500",
      text: "text-red-600",
    },
  }

  const colors = colorMap[color]

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${colors.fill}`}></span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${colors.text}`}>{value}</span>
          <span className="text-xs text-gray-400">({percentage}%)</span>
        </div>
      </div>
      <div className={`h-3 ${colors.bg} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${colors.fill} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, description, icon, color, trend }) {
  const colorMap = {
    purple: {
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
      valueText: "text-purple-700",
    },
    emerald: {
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      valueText: "text-emerald-700",
    },
    amber: {
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      valueText: "text-amber-700",
    },
  }

  const colors = colorMap[color]

  const trendIcon = {
    up: (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        Good
      </span>
    ),
    warning: (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Attention
      </span>
    ),
    neutral: (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
        Normal
      </span>
    ),
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center ${colors.iconText}`}>
          {icon}
        </div>
        {trendIcon[trend]}
      </div>
      
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${colors.valueText}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
  )
}

function SummaryItem({ label, value, icon, highlight, isStatus }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'} transition-colors duration-200`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-lg font-bold ${highlight ? 'text-amber-700' : isStatus ? 'text-emerald-600' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}