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

  const [showSupportModal, setShowSupportModal] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

  const handleOpenSupport = () => {
    setShowSupportModal(true)
  }

  const handleCloseSupport = () => {
    setShowSupportModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-50 to-green-100 rounded-full translate-y-16 -translate-x-16 opacity-40"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-white text-xl">🌾</span>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name || "Farmer"}
                </h1>
                <p className="text-gray-500 text-sm lg:text-base">
                  Your agricultural insurance dashboard
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Active Account
              </span>
              <span className="text-gray-300">|</span>
              <span>Last updated: Today</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Claims Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Claims" 
              value={stats.total} 
              color="blue" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              } 
            />
            <StatCard 
              title="Pending Review" 
              value={stats.pending} 
              color="yellow" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } 
            />
            <StatCard 
              title="Approved" 
              value={stats.approved} 
              color="emerald" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } 
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/claim/apply"
                className="group relative overflow-hidden p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-transparent hover:border-emerald-200 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-full -translate-y-10 translate-x-10 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Apply for New Claim</h3>
                  <p className="text-sm text-gray-500">Submit a new insurance claim</p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>

              <Link
                to="/claim"
                className="group relative overflow-hidden p-5 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-transparent hover:border-slate-200 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-100 rounded-full -translate-y-10 translate-x-10 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">View My Claims</h3>
                  <p className="text-sm text-gray-500">Track your claim status</p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Support Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-6 rounded-2xl shadow-xl text-white">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-white/20">
                <svg className="w-6 h-6 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold mb-2">Need Help?</h2>
              <p className="text-emerald-100/80 text-sm mb-6 leading-relaxed">
                Our dedicated support team is available around the clock to assist you.
              </p>
              
              <button 
                onClick={handleOpenSupport}
                className="w-full bg-white text-emerald-900 px-5 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Support
              </button>
              
              <p className="text-center text-emerald-200/60 text-xs mt-4">
                Available 24/7 • Response within 2 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <SupportModal onClose={handleCloseSupport} />
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colorMap = {
    blue: {
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      shadow: "shadow-blue-100",
      iconBg: "bg-blue-100",
    },
    yellow: {
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      shadow: "shadow-amber-100",
      iconBg: "bg-amber-100",
    },
    emerald: {
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      shadow: "shadow-emerald-100",
      iconBg: "bg-emerald-100",
    },
  }

  const colors = colorMap[color]

  return (
    <div className={`group relative overflow-hidden bg-white p-6 rounded-2xl border ${colors.border} shadow-lg hover:shadow-xl ${colors.shadow} transition-all duration-300 hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:scale-125 transition-transform duration-500`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className={`text-4xl font-bold mt-2 ${colors.text}`}>
              {value}
            </p>
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg text-white`}>
            {icon}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}></span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SupportModal({ onClose }) {
  const adminInfo = {
    name: "AgriInsure Support Team",
    designation: "Customer Support Administrator",
    email: "support@agriinsure.com",
    phone: "+1 (800) 123-4567",
    alternatePhone: "+1 (800) 765-4321",
    workingHours: "24/7 Available",
    address: "123 Agriculture Lane, Farm City, FC 12345",
  }

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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 p-6 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
          
          {/* Close Button (Cross Icon) */}
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
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">{adminInfo.name}</h3>
              <p className="text-emerald-100 text-sm">{adminInfo.designation}</p>
            </div>
          </div>
        </div>
        
        {/* Contact Details */}
        <div className="p-6 space-y-4">
          {/* Email */}
          <a 
            href={`mailto:${adminInfo.email}`}
            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors duration-200 group"
          >
            <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors duration-200">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email Address</p>
              <p className="text-gray-800 font-semibold">{adminInfo.email}</p>
            </div>
          </a>
          
          {/* Phone */}
          <a 
            href={`tel:${adminInfo.phone}`}
            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors duration-200 group"
          >
            <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors duration-200">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone Number</p>
              <p className="text-gray-800 font-semibold">{adminInfo.phone}</p>
              <p className="text-gray-500 text-sm">{adminInfo.alternatePhone}</p>
            </div>
          </a>
          
          {/* Working Hours */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Working Hours</p>
              <p className="text-gray-800 font-semibold">{adminInfo.workingHours}</p>
            </div>
          </div>
          
          {/* Address */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Office Address</p>
              <p className="text-gray-800 font-semibold text-sm">{adminInfo.address}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">We typically respond within 2 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}