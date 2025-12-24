import { useEffect, useState } from "react"
import api from "../../api/axios"
import toast from "react-hot-toast"
import Loader from "../../components/Loader"
import { Link } from "react-router-dom"

export default function MyClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState(null)

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

  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          dot: "bg-emerald-500",
        }
      case "rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          dot: "bg-red-500",
        }
      default:
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          dot: "bg-amber-500",
        }
    }
  }

  const handleCloseModal = () => {
    setSelectedClaim(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-50 to-green-100 rounded-full translate-y-16 -translate-x-16 opacity-40"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Claims</h1>
                <p className="text-gray-500 mt-1">Track the status of your insurance claims</p>
              </div>
            </div>
            
            <Link
              to="/claim/apply"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Claim
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        {claims.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {claims.filter(c => c.status === "pending").length}
                </p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {claims.filter(c => c.status === "approved").length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Claims Content */}
        {claims.length === 0 ? (
          <div className="relative overflow-hidden bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-gray-50 to-slate-100 rounded-full -translate-y-24 translate-x-24 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-full translate-y-16 -translate-x-16 opacity-40"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You haven't submitted any insurance claims yet. Start by applying for your first claim to protect your crops.
              </p>
              
              <Link
                to="/claim/apply"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Apply for your first claim
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                All Claims
              </h2>
              <span className="text-sm text-gray-500">{claims.length} total</span>
            </div>

            {/* Claims Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claims.map((claim) => {
                const statusConfig = getStatusConfig(claim.status)
                
                return (
                  <div
                    key={claim._id}
                    className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Decorative Element */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${statusConfig.bg} rounded-full -translate-y-12 translate-x-12 opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
                    
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-xl">🌾</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors duration-200">
                        {claim.cropType}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {claim.reason}
                      </p>

                      {/* Expected Amount */}
                      {claim.expectedAmount && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">Expected:</span>
                          <span className="text-sm font-bold text-emerald-600">₹{claim.expectedAmount?.toLocaleString()}</span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(claim.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <button 
                          onClick={() => setSelectedClaim(claim)}
                          className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors duration-200"
                        >
                          View Details
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <ClaimDetailModal claim={selectedClaim} onClose={handleCloseModal} getStatusConfig={getStatusConfig} />
      )}
    </div>
  )
}

function ClaimDetailModal({ claim, onClose, getStatusConfig }) {
  const statusConfig = getStatusConfig(claim.status)

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 p-6 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
          
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer z-20"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <span className="text-2xl">🌾</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{claim.cropType}</h3>
                <p className="text-emerald-100 text-sm">Claim Details</p>
              </div>
            </div>
            
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30`}
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`}></span>
              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Reason */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reason for Claim
            </label>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-xl leading-relaxed">
              {claim.reason}
            </p>
          </div>

          {/* Expected Amount */}
          {claim.expectedAmount && (
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Expected Amount</p>
                <p className="text-2xl font-bold text-emerald-700">₹{claim.expectedAmount?.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Damage Image */}
          {claim.damageImage && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Damage Evidence
              </label>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <img 
                  src={claim.damageImage} 
                  alt="Damage" 
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs uppercase tracking-wide font-medium">Submitted</span>
              </div>
              <p className="text-gray-800 font-semibold">
                {new Date(claim.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className="text-xs uppercase tracking-wide font-medium">Claim ID</span>
              </div>
              <p className="text-gray-800 font-semibold text-sm truncate">
                {claim._id}
              </p>
            </div>
          </div>

          {/* Admin Remarks (if rejected) */}
          {claim.status === "rejected" && claim.remarks && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Rejection Reason</span>
              </div>
              <p className="text-red-700 text-sm">{claim.remarks}</p>
            </div>
          )}

          {/* Approved Amount (if approved) */}
          {claim.status === "approved" && claim.approvedAmount && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Approved Amount</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">₹{claim.approvedAmount?.toLocaleString()}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <div className={`p-4 ${statusConfig.bg} rounded-xl border ${statusConfig.border}`}>
            <div className={`flex items-center gap-2 ${statusConfig.text}`}>
              {statusConfig.icon}
              <span className="text-sm font-medium">
                {claim.status === "pending" && "Your claim is being reviewed by our team"}
                {claim.status === "approved" && "Your claim has been approved"}
                {claim.status === "rejected" && "Your claim has been rejected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}