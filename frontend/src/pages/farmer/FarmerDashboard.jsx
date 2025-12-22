import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import api from "../../api/axios"

export default function FarmerDashboard() {
  const { user } = useSelector((state) => state.auth)

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch current user's claims (backend route: /claim/my)
        const res = await api.get("/claim/my")

        const claims = res.data.data || []

        const total = claims.length
        const pending = claims.filter((c) => c.status === "pending").length
        const approved = claims.filter((c) => c.status === "approved").length

        setStats({ total, pending, approved })
      } catch (err) {
        console.error("Failed to fetch claim stats", err)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name || "Farmer"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your insurance claims.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Claims" value={stats.total} color="blue" icon="📄" />
        <StatCard title="Pending" value={stats.pending} color="yellow" icon="⏳" />
        <StatCard title="Approved" value={stats.approved} color="emerald" icon="✅" />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <Link
            to="/claim/apply"
            className="block p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 mb-3"
          >
            ✍️ Apply for New Claim
          </Link>

          <Link
            to="/claim"
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            📋 View My Claims
          </Link>
        </div>

        <div className="bg-emerald-900 p-6 rounded-xl text-white">
          <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
          <p className="text-emerald-100 mb-4">
            Our support team is available 24/7.
          </p>
          <button className="bg-white text-emerald-900 px-4 py-2 rounded">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

/* ✅ SAFE Tailwind (NO dynamic classes) */
function StatCard({ title, value, icon, color }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    yellow: "text-yellow-600 bg-yellow-50",
    emerald: "text-emerald-600 bg-emerald-50",
  }

  return (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-3xl font-bold ${colorMap[color].split(" ")[0]}`}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

