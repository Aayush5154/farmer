import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import LogoutButton from "./LogoutButton"

export default function Layout({ children }) {
    const { user } = useSelector((state) => state.auth)
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const isAdmin = user?.role === "admin"

    const navItems = isAdmin
        ? [
            { name: "Dashboard", path: "/admin", icon: "📊" },
            // Add more admin links here if needed
        ]
        : [
            { name: "Dashboard", path: "/", icon: "🏠" },
            { name: "My claims", path: "/claim", icon: "📄" },
            { name: "Apply Claim", path: "/claim/apply", icon: "✍️" },
        ]

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-emerald-900 text-white">
                <div className="p-6 border-b border-emerald-800">
                    <h1 className="text-2xl font-bold tracking-tight">AgriSure</h1>
                    <p className="text-emerald-300 text-sm">Farmer Insurance</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                    ? "bg-emerald-700 text-white"
                                    : "text-emerald-100 hover:bg-emerald-800"
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                    <div className="p-4 border-t border-emerald-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-emerald-300 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    {/* Logout moved to header for cleaner UI */}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center z-20">
                    <h1 className="text-xl font-bold text-emerald-900">AgriSure</h1>

                    <div className="flex items-center gap-3">
                        <LogoutButton className="text-sm px-3 py-1 bg-emerald-800 text-white rounded hidden sm:inline-flex" />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-600"
                        >
                            {isMobileMenuOpen ? "✖️" : "☰"}
                        </button>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between bg-white shadow-sm p-4 z-20">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-emerald-900">AgriSure</h1>
                        <p className="text-sm text-gray-500">Farmer Insurance</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-medium">{user?.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                        </div>
                        <LogoutButton className="bg-emerald-800 hover:bg-emerald-700 text-white" />
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute inset-0 bg-emerald-900 z-10 pt-20 px-6 pb-6 text-white flex flex-col">
                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${location.pathname === item.path
                                            ? "bg-emerald-700"
                                            : "hover:bg-emerald-800"
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-auto pt-6 border-t border-emerald-800">
                            <LogoutButton className="w-full justify-center bg-emerald-800" />
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t mt-auto p-4 text-sm text-gray-500">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div>© {new Date().getFullYear()} AgriSure</div>
                        <div className="text-xs text-gray-400">Prototype v0.1</div>
                    </div>
                </footer>
            </div>
        </div>
    )
}
