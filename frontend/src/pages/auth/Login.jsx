// src/pages/auth/Login.jsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"

import { setCredentials } from "../../features/auth/authSlice"
import { loginApi } from "../../features/auth/authAPI"

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  const onSubmit = async (data) => {
    try {
      const res = await loginApi(data)
      dispatch(setCredentials(res.data.data))
      toast.success("Welcome back!")

      const role = res.data.data.user.role
      navigate(role === "admin" ? "/admin" : "/")
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <main className="min-h-screen flex">
      {/* Left Side - Decorative Panel */}
      <div 
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden"
        style={{
          backgroundImage: 'url("/photo2.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-teal-900/90"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-400/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-20 h-20 border border-emerald-500/20 rounded-2xl rotate-12 animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-16 h-16 border border-teal-500/20 rounded-xl -rotate-12"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-emerald-500/10 rounded-lg rotate-45"></div>
        <div className="absolute bottom-40 right-40 w-24 h-24 border border-emerald-400/10 rounded-3xl rotate-6"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-900/50">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
            Welcome to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              AgriSure
            </span>
          </h1>
          
          <p className="text-emerald-200/80 text-lg xl:text-xl max-w-md leading-relaxed mb-8">
            Protecting farmers with reliable crop insurance solutions. Your harvest, our commitment.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <FeatureItem 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              text="Secure & Encrypted Data"
            />
            <FeatureItem 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              text="Fast Claim Processing"
            />
            <FeatureItem 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              text="24/7 Support Available"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 pt-8 border-t border-emerald-700/30">
            <StatItem value="10K+" label="Farmers" />
            <StatItem value="₹50Cr+" label="Claims Paid" />
            <StatItem value="98%" label="Satisfaction" />
          </div>
        </div>

        {/* Bottom Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950/50 to-transparent"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-950 to-teal-950 p-6 sm:p-8 lg:p-12 relative overflow-hidden">
        {/* Mobile Background Image */}
        <div 
          className="absolute inset-0 lg:hidden opacity-20"
          style={{
            backgroundImage: 'url("/photo2.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <header className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-lg shadow-emerald-900/50 mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-extrabold text-3xl tracking-tight text-white">
              Agri<span className="text-emerald-400">Sure</span>
            </h1>
            <p className="text-emerald-300/70 mt-1 text-sm">Farmer Insurance Portal</p>
          </header>

          {/* Desktop Welcome Text */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-emerald-300/70">Sign in to access your dashboard</p>
          </div>

          {/* Form Card */}
          <section className="bg-emerald-900/30 backdrop-blur-xl border border-emerald-700/30 rounded-3xl p-8 shadow-2xl shadow-emerald-950/50">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-emerald-100">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg 
                      className={`w-5 h-5 transition-colors duration-200 ${errors.email ? 'text-red-400' : 'text-emerald-500 group-focus-within:text-emerald-400'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email" }
                    })}
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl bg-emerald-950/50 outline-none transition-all duration-200 text-white placeholder-emerald-400/50
                      ${errors.email 
                        ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-emerald-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1.5 text-sm text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-emerald-100">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg 
                      className={`w-5 h-5 transition-colors duration-200 ${errors.password ? 'text-red-400' : 'text-emerald-500 group-focus-within:text-emerald-400'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.password}
                    {...register("password", { required: "Password is required" })}
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-emerald-950/50 outline-none transition-all duration-200 text-white placeholder-emerald-400/50
                      ${errors.password 
                        ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-emerald-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                  />
                  {/* Toggle Button */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    onClick={() => setShowPass(p => !p)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-emerald-500 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {showPass ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1.5 text-sm text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      {...register("remember")}
                    />
                    <div className="w-5 h-5 border-2 border-emerald-600/50 rounded-md bg-emerald-950/50 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all duration-200"></div>
                    <svg 
                      className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-emerald-200 group-hover:text-emerald-100 transition-colors">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`relative w-full py-4 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 group
                  ${isSubmitting 
                    ? "bg-emerald-600/50 text-emerald-200 cursor-not-allowed" 
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
                  }`}
              >
                {/* Shimmer Effect */}
                {!isSubmitting && (
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                )}
                
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-700/50 to-transparent"></div>
              <span className="text-sm text-emerald-500/70 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-700/50 to-transparent"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toast("Coming soon!")}
                className="flex items-center justify-center gap-2 py-3 border-2 border-emerald-700/50 rounded-xl text-emerald-200 hover:bg-emerald-800/30 hover:border-emerald-600/50 transition-all duration-200 group"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-5 h-5" />
                <span className="font-medium text-sm">Google</span>
              </button>
              <button
                type="button"
                onClick={() => toast("Coming soon!")}
                className="flex items-center justify-center gap-2 py-3 border-2 border-emerald-700/50 rounded-xl text-emerald-200 hover:bg-emerald-800/30 hover:border-emerald-600/50 transition-all duration-200 group"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="font-medium text-sm">GitHub</span>
              </button>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-emerald-300/70">
              Don't have an account?{" "}
              <Link
                to="/register"
                onMouseEnter={() => import("./Register" /* webpackPrefetch: true */).catch(() => {})}
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors duration-200 hover:underline underline-offset-2"
              >
                Create account
              </Link>
            </p>
          </section>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-emerald-500/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs">Secured with 256-bit encryption</span>
          </div>

          {/* Copyright */}
          <footer className="mt-4 text-center">
            <p className="text-xs text-emerald-600/50">
              © 2025 AgriSure. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}

// Feature Item Component
function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-emerald-200/80">
      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  )
}

// Stat Item Component
function StatItem({ value, label }) {
  return (
    <div>
      <p className="text-2xl xl:text-3xl font-bold text-white">{value}</p>
      <p className="text-emerald-400/70 text-sm">{label}</p>
    </div>
  )
}