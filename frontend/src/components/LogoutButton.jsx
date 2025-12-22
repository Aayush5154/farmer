import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { logout } from "../features/auth/authSlice"

export default function LogoutButton() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    toast.success("Logged out successfully")
    navigate("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="border px-4 py-1 rounded hover:bg-gray-100"
    >
      Logout
    </button>
  )
}
