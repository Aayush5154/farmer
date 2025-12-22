import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"

import { setCredentials } from "../../features/auth/authSlice"
import { loginApi } from "../../features/auth/authAPI"

export default function Login() {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      // Quick client-side validation give immediate feedback
      if (!data.email || !data.password) {
        toast.error("Please enter email and password")
        return
      }

      const res = await loginApi(data)

      dispatch(setCredentials(res.data.data))
      toast.success("Login successful")

      const role = res.data.data.user.role

      // Prefetch destination page to make navigation feel instant
      try {
        if (role === "admin") {
          import("../admin/AdminDashboard").catch(() => {})
        } else {
          import("../farmer/FarmerDashboard").catch(() => {})
        }
      } catch (e) {
        // ignore
      }

      // ✅ REDIRECT AFTER LOGIN
      if (role === "admin") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl shadow mb-4">
            <span className="text-4xl">🌾</span>
          </div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">AgriSure</h1>
          <p className="text-emerald-700 text-lg">Farmer Insurance Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">📧</span>
                </div>
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
                <input
                  {...register("password", { required: true })}
                  type="password"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl transform hover:scale-[1.02]'}`}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                onMouseEnter={() => {
                  import('./Register' /* webpackPrefetch: true */).catch(() => {})
                }}
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <p className="text-sm text-emerald-700 opacity-70">Secure & Reliable Insurance Solutions</p>
        </div>
      </div>
    </div>
  )
}
