import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth)

  // 🔒 Auth not ready yet → block rendering
  if (isAuthenticated === null) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
