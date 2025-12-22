import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but not admin → go to farmer dashboard
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}
