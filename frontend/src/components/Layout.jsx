import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { useState, useEffect } from "react"
import LogoutButton from "./LogoutButton"

export default function Layout({ children }) {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = user?.role === "admin"

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [sidebarOpen])

  // Define navigation items based on user role
  const navItems = isAdmin
    ? [
        { name: "Dashboard", path: "/admin", icon: "home" },
        { name: "Analytics", path: "/admin/analytics", icon: "chart" },
        { name: "User Management", path: "/admin/users", icon: "users" },
      ]
    : [
        { name: "Overview", path: "/", icon: "home" },
        { name: "My Claims", path: "/claim", icon: "document" },
        { name: "Apply Claim", path: "/claim/apply", icon: "plus-circle" },
        { name: "Resources", path: "/resources", icon: "resource" },
      ]

  const icons = {
    home: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    document: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    "plus-circle": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    resource: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={handleCloseSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-gradient-to-b from-emerald-950 via-emerald-950 to-teal-950 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/Brand Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-white text-lg font-bold tracking-tight">AgriSure</span>
              <p className="text-emerald-400 text-xs">Insurance Portal</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={handleCloseSidebar}
            className="md:hidden w-8 h-8 flex items-center justify-center text-emerald-300 hover:text-white hover:bg-emerald-800/50 rounded-lg transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info Card */}
        <div className="px-4 py-5">
          <div className="bg-emerald-900/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{user?.name || "User"}</p>
                <p className="text-emerald-400 text-xs truncate">{user?.email || "user@example.com"}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-800/50">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isAdmin 
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`}></span>
                {isAdmin ? "Administrator" : "Farmer"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="text-emerald-500 text-xs font-semibold uppercase tracking-wider px-4 mb-3">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium relative overflow-hidden
                  ${
                    isActive
                      ? "bg-white text-emerald-950 shadow-lg shadow-emerald-900/30"
                      : "text-emerald-200 hover:bg-emerald-900/50 hover:text-white"
                  }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full"></div>
                )}
                
                <span className={`transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}>
                  {icons[item.icon]}
                </span>
                <span>{item.name}</span>
                
                {/* Arrow indicator for active */}
                {isActive && (
                  <svg className="w-4 h-4 ml-auto text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-emerald-800/50">
          {/* Help Card */}
          <div className="bg-gradient-to-br from-emerald-800/50 to-teal-800/50 rounded-xl p-4 mb-4 border border-emerald-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-700/50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Need Help?</p>
                <p className="text-emerald-400 text-xs">We're here 24/7</p>
              </div>
            </div>
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Support
            </button>
          </div>

          {/* Version Info */}
          <div className="text-center">
            <p className="text-emerald-600 text-xs">
              AgriSure v1.0.0
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={handleToggleSidebar}
              className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>

            {/* Page Title / Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center md:hidden">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                  {navItems.find(item => item.path === location.pathname)?.name || "AgriSure"}
                </h1>
                <p className="text-xs text-gray-500 hidden lg:block">
                  {isAdmin ? "Admin Dashboard" : "Farmer Portal"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search Button (Optional) */}
            <button className="hidden lg:flex w-10 h-10 items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Notifications Button */}
            <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification Badge */}
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

            {/* User Info (Desktop) */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{isAdmin ? "Admin" : "Farmer"}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>

            {/* Logout Button */}
            <LogoutButton />
          </div>
        </header>

        {/* Main Content Section */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Optional Enhancement) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-30">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 4).map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors duration-200 ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-500 hover:text-emerald-600"
                  }`}
                >
                  <span className={`${isActive ? "scale-110" : ""} transition-transform duration-200`}>
                    {icons[item.icon]}
                  </span>
                  <span className="text-xs font-medium">{item.name.split(" ")[0]}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}