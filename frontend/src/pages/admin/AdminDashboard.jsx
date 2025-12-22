import { useEffect, useState, useCallback } from "react"
import api from "../../api/axios"
import toast from "react-hot-toast"
import Loader from "../../components/Loader"

export default function AdminDashboard() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/claim/all")
      console.debug("Fetched claims:", res.data?.data)
      if (res.data?.data) {
        setClaims(res.data.data)
      } else {
        setClaims([])
      }
    } catch (err) {
      console.error("Fetch claims error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch claims"
      toast.error(errorMessage)
      setClaims([])
    } finally {
      setLoading(false)
    }
  }, [])

  const openDetails = async (claim) => {
    try {
      setSelectedClaim(claim)
      setIsModalOpen(true)

      const sensorRef = claim.sensorDataId
      const needsFetch = sensorRef && (sensorRef.soilMoisture === undefined || sensorRef.soilMoisture === null)

      if (sensorRef && needsFetch) {
        setDetailsLoading(true)
        const sensorId = typeof sensorRef === "string" ? sensorRef : sensorRef._id
        const res = await api.get(`/sensor/${sensorId}`)
        const sensor = res.data?.data
        setSelectedClaim((prev) => ({ ...prev, sensorDataId: sensor }))
      }
    } catch (err) {
      console.error("Failed to load sensor details:", err)
      toast.error(err.response?.data?.message || "Failed to load sensor")
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(true)
      await api.patch(`/claim/${id}`, { status })
      toast.success(`Claim ${status} successfully`)
      fetchClaims()
    } catch (err) {
      console.error("Update status error:", err)
      toast.error(err.response?.data?.message || "Action failed")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <Loader />

  const pendingCount = claims.filter(c => c.status === 'pending').length
  const approvedCount = claims.filter(c => c.status === 'approved').length
  const rejectedCount = claims.filter(c => c.status === 'rejected').length

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800"
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  // Derive who handled the claim: admin user or system (auto decision)
  const getHandledBy = (claim) => {
    if (!claim) return '—'

    if (claim.approvedBy && claim.approvedBy.name) {
      return claim.approvedBy.name
    }

    // Check history for auto actions
    const autoEntry = claim.history?.find(
      (h) => h.action === 'auto_approved' || h.action === 'auto_rejected'
    )

    if (autoEntry) {
      return autoEntry.action === 'auto_approved' ? 'System (auto-approved)' : 'System (auto-rejected)'
    }

    if (claim.autoStatus === 'approved') return 'System (auto-approved)'
    if (claim.autoStatus === 'rejected') return 'System (auto-rejected)'

    return '—'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and review insurance claims</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Claims</p>
          <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Pending Requests (compact cards) */}
      {pendingCount > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending Requests</h3>
            <div className="text-sm text-gray-500">{pendingCount} waiting</div>
          </div>

          <div className="space-y-3">
            {claims.filter(c => c.status === 'pending').slice(0,5).map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                    {c.farmerId?.name?.[0]?.toUpperCase() || 'F'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">{c.farmerId?.name}</div>
                    <div className="text-xs text-gray-500">{c.cropType} • {new Date(c.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xl">{c.reason}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => openDetails(c)} className="text-sm text-blue-600 hover:underline">View</button>
                  <button onClick={() => updateStatus(c._id, 'approved')} className="text-sm text-green-600 hover:underline">Approve</button>
                  <button onClick={() => updateStatus(c._id, 'rejected')} className="text-sm text-red-600 hover:underline">Reject</button>
                </div>
              </div>
            ))}
          </div>

          {pendingCount > 5 && (
            <div className="text-xs text-gray-500 mt-3">Showing 5 of {pendingCount} pending requests • <button onClick={() => {/* placeholder for view all */}} className="text-blue-600">View all</button></div>
          )}
        </div>
      )}

      {/* Claims Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
        </div>

        {claims.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No claims found to display.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Farmer</th>
                  <th className="px-6 py-4 font-medium">Crop Type</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>                  <th className="px-6 py-4 font-medium">Handled By</th>                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{claim.farmerId?.name}</div>
                      <div className="text-xs text-gray-500">{claim.farmerId?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{claim.cropType}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={claim.reason}>
                      {claim.reason}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{getHandledBy(claim)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openDetails(claim)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View
                      </button>
                      {claim.status === "pending" && (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => updateStatus(claim._id, "approved")}
                            className="text-green-600 hover:text-green-800 font-medium text-sm disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => updateStatus(claim._id, "rejected")}
                            className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {claim.status !== "pending" && (
                        <span className="text-gray-400 text-sm italic">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Claim Details Modal */}
      {isModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white p-6 rounded-lg z-50 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">Claim Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500">Close</button>
            </div>
            <div className="mt-2 text-sm text-gray-600">Processed by: <strong>{getHandledBy(selectedClaim)}</strong></div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Damage Image</p>
                {selectedClaim.damageImage ? (
                  <a href={selectedClaim.damageImage} target="_blank" rel="noreferrer">
                    <img src={selectedClaim.damageImage} alt="Damage" className="w-full h-64 object-cover rounded mt-2" />
                  </a>
                ) : (
                  <p className="text-gray-500 mt-2">No image available</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Sensor Readings</p>
                {detailsLoading ? (
                  <p className="text-gray-500 mt-2">Loading sensor data...</p>
                ) : selectedClaim.sensorDataId && selectedClaim.sensorDataId.soilMoisture !== undefined ? (
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <div>Soil Moisture: <strong>{selectedClaim.sensorDataId.soilMoisture}</strong></div>
                    <div>Air Temp: <strong>{selectedClaim.sensorDataId.airTemp}</strong></div>
                    <div>Humidity: <strong>{selectedClaim.sensorDataId.humidity}</strong></div>
                    <div>Soil Temp: <strong>{selectedClaim.sensorDataId.soilTemp}</strong></div>
                    <div className="text-xs text-gray-400">Recorded: {new Date(selectedClaim.sensorDataId.createdAt).toLocaleString()}</div>
                  </div>
                ) : selectedClaim.sensorDataId ? (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-500">Sensor linked but not loaded.</p>
                    <button onClick={() => openDetails(selectedClaim)} className="mt-2 text-blue-600 text-sm">Load sensor data</button>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">No sensor data linked to this claim.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
