import { useEffect, useState } from "react"
import api from "../../api/axios"
import toast from "react-hot-toast"
import Loader from "../../components/Loader"
import { Link } from "react-router-dom"

export default function MyClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMyClaims = async () => {
    try {
      setLoading(true)
      const res = await api.get("/claim/my")
      setClaims(res.data.data)
    } catch (err) {
      toast.error("Failed to load claims")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyClaims()
  }, [])

  if (loading) return <Loader />

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-500 mt-1">Track the status of your insurance claims</p>
        </div>
        <Link
          to="/claim/apply"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          + New Claim
        </Link>
      </div>

      {claims.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-gray-400">
            📄
          </div>
          <h3 className="text-lg font-medium text-gray-900">No claims found</h3>
          <p className="text-gray-500 mt-1 mb-6">You haven't submitted any insurance claims yet.</p>
          <Link
            to="/claims/apply"
            className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline"
          >
            Apply for your first claim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((claim) => (
            <div
              key={claim._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-lg">
                  🌾
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    claim.status
                  )}`}
                >
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {claim.cropType}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {claim.reason}
              </p>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  {new Date(claim.createdAt).toLocaleDateString()}
                </span>
                <span className="text-emerald-600 font-medium cursor-pointer hover:underline">
                  View Details
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
