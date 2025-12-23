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
  const [showAllPending, setShowAllPending] = useState(false)
  
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [claimToApprove, setClaimToApprove] = useState(null)
  const [approvedAmount, setApprovedAmount] = useState("")

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

  const openApprovalModal = (claim) => {
    setClaimToApprove(claim)
    setApprovedAmount(claim.approvedAmount || claim.expectedAmount || "")
    setIsApprovalModalOpen(true)
  }

  const handleApproveWithAmount = async () => {
    if (!claimToApprove) return

    const amount = Number(approvedAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid approved amount")
      return
    }

    try {
      setActionLoading(true)
      await api.patch(`/claim/${claimToApprove._id}`, { 
        status: "approved",
        approvedAmount: amount
      })
      toast.success(`Claim approved with ₹${amount.toLocaleString()}`)
      setIsApprovalModalOpen(false)
      setClaimToApprove(null)
      setApprovedAmount("")
      fetchClaims()
    } catch (err) {
      console.error("Approval error:", err)
      toast.error(err.response?.data?.message || "Approval failed")
    } finally {
      setActionLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(true)
      const payload = { status }
      
      await api.patch(`/claim/${id}`, payload)
      toast.success(`Claim ${status} successfully`)
      fetchClaims()
    } catch (err) {
      console.error("Update status error:", err)
      console.error("Error details:", err.response?.data)
      toast.error(err.response?.data?.message || "Action failed")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <Loader />

  const pendingCount = claims.filter(c => c.status === 'pending').length
  const approvedCount = claims.filter(c => c.status === 'approved').length
  const rejectedCount = claims.filter(c => c.status === 'rejected').length

  const pendingList = claims.filter(c => c.status === 'pending')

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-50 text-green-700 border border-green-200",
      rejected: "bg-red-50 text-red-700 border border-red-200",
      pending: "bg-yellow-50 text-yellow-700 border border-yellow-200"
    }
    return (
      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const getHandledBy = (claim) => {
    if (!claim) return '—'
    if (claim.approvedBy && claim.approvedBy.name) {
      return claim.approvedBy.name
    }
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and review insurance claims</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Claims</p>
                <p className="text-3xl font-bold text-gray-900">{claims.length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Section */}
        {pendingCount > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
                <p className="text-sm text-gray-500 mt-1">{pendingCount} claims awaiting review</p>
              </div>
            </div>

            <div className="space-y-4">
              {(showAllPending ? pendingList : pendingList.slice(0,5)).map((c) => (
                <div key={c._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold text-lg">
                      {c.farmerId?.name?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{c.farmerId?.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="inline-block bg-gray-100 px-2 py-0.5 rounded mr-2">{c.cropType}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 line-clamp-1">{c.reason}</div>
                      <div className="text-sm text-gray-700 mt-2">
                        Requested: <strong className="text-gray-900">{c.expectedAmount ? `₹${Number(c.expectedAmount).toLocaleString()}` : '—'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openDetails(c)} 
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md font-medium transition-colors"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => openApprovalModal(c)} 
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => updateStatus(c._id, 'rejected')} 
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pendingCount > 5 && (
              <div className="text-center mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setShowAllPending(!showAllPending)} 
                  className="text-gray-700 hover:text-gray-900 font-medium text-sm inline-flex items-center gap-2"
                >
                  {showAllPending ? 'Show Less' : `View All ${pendingCount} Pending Claims`}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAllPending ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Claims Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Claims</h2>
          </div>

          {claims.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No claims found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Crop</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Handled By</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {claims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
                            {claim.farmerId?.name?.[0]?.toUpperCase() || 'F'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{claim.farmerId?.name}</div>
                            <div className="text-xs text-gray-500">{claim.farmerId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{claim.cropType}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="line-clamp-2" title={claim.reason}>{claim.reason}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.expectedAmount ? `₹${Number(claim.expectedAmount).toLocaleString()}` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(claim.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{getHandledBy(claim)}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => openDetails(claim)}
                          className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                        >
                          View
                        </button>
                        {claim.status === "pending" && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => openApprovalModal(claim)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => updateStatus(claim._id, "rejected")}
                              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {claim.status !== "pending" && (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {isApprovalModalOpen && claimToApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsApprovalModalOpen(false)}></div>
            <div className="bg-white rounded-lg z-50 max-w-md w-full shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-xl font-semibold text-gray-900">Approve Claim</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Farmer:</span>
                    <span className="text-sm font-semibold text-gray-900">{claimToApprove.farmerId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Crop Type:</span>
                    <span className="text-sm font-semibold text-gray-900">{claimToApprove.cropType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Requested Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">₹{Number(claimToApprove.expectedAmount).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Reason:</span>
                    <p className="text-sm text-gray-700 mt-1">{claimToApprove.reason}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Approved Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    placeholder="Enter approved amount"
                    min="0"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the final approved amount for this claim
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsApprovalModalOpen(false)
                      setClaimToApprove(null)
                      setApprovedAmount("")
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-gray-700"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveWithAmount}
                    disabled={actionLoading || !approvedAmount}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? "Processing..." : "Approve Claim"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claim Details Modal */}
        {isModalOpen && selectedClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-lg z-50 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Claim Details</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Processed By</p>
                    <p className="font-semibold text-gray-900">{getHandledBy(selectedClaim)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Requested Amount</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.expectedAmount ? `₹${Number(selectedClaim.expectedAmount).toLocaleString()}` : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Approved Amount</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.approvedAmount ? `₹${Number(selectedClaim.approvedAmount).toLocaleString()}` : '—'}
                    </p>
                  </div>
                </div>

                {selectedClaim.decisionSource && (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Decision Source</p>
                        <p className="font-semibold text-gray-900">{selectedClaim.decisionSource}</p>
                      </div>
                      {selectedClaim.mlUsed !== undefined && (
                        <span className="text-xs text-gray-600">ML: {selectedClaim.mlUsed ? 'Used' : 'Not Used'}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Damage Image</p>
                    {selectedClaim.damageImage ? (
                      <a href={selectedClaim.damageImage} target="_blank" rel="noreferrer">
                        <img 
                          src={selectedClaim.damageImage} 
                          alt="Damage" 
                          className="w-full h-64 object-cover rounded border border-gray-300 hover:border-gray-400 transition-colors" 
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                      </a>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                        <p className="text-gray-400">No image available</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Sensor Readings</p>
                    {detailsLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading...</div>
                      </div>
                    ) : selectedClaim.sensorDataId && selectedClaim.sensorDataId.soilMoisture !== undefined ? (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Soil Moisture</span>
                            <span className="font-semibold text-gray-900">{selectedClaim.sensorDataId.soilMoisture}%</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Air Temperature</span>
                            <span className="font-semibold text-gray-900">{selectedClaim.sensorDataId.airTemp}°C</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Humidity</span>
                            <span className="font-semibold text-gray-900">{selectedClaim.sensorDataId.humidity}%</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Soil Temperature</span>
                            <span className="font-semibold text-gray-900">{selectedClaim.sensorDataId.soilTemp}°C</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-3">
                          Recorded: {new Date(selectedClaim.sensorDataId.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ) : selectedClaim.sensorDataId ? (
                      <div className="h-64 flex flex-col items-center justify-center">
                        <p className="text-gray-500 mb-3">Sensor data not loaded</p>
                        <button 
                          onClick={() => openDetails(selectedClaim)} 
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                        >
                          Load Sensor Data
                        </button>
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <p className="text-gray-500">No sensor data linked</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}