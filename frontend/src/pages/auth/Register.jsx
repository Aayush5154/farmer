import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"

import { registerApi } from "../../features/auth/authAPI"

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()

  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      // quick client-side validation
      if (!data.name || !data.email || !data.password) {
        toast.error("Please fill all required fields")
        return
      }

      await registerApi(data)
      toast.success("Registration successful. Please login.")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
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
          <p className="text-emerald-700 text-lg">Create Your Account</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join Us Today</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">👤</span>
                </div>
                <input
                  {...register("name", { required: true })}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base"
                />
              </div>
            </div>

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
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base"
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
                  {...register("password", { required: true, minLength: 6 })}
                  type="password"
                  placeholder="Enter your password (min 6 characters)"
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base disabled:opacity-60"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 ml-1">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl transform hover:scale-[1.02]'}`}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                onMouseEnter={() => {
                  import('./Login' /* webpackPrefetch: true */).catch(() => {})
                }}
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <p className="text-sm text-emerald-700 opacity-70">Start protecting your crops today</p>
        </div>
      </div>
    </div>
  )
}
