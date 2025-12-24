import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import React, { Suspense, lazy } from "react"

// Lazy-loaded pages (route-based code splitting)
const Login = lazy(() => import("./pages/auth/Login"))
const Register = lazy(() => import("./pages/auth/Register"))

const FarmerDashboard = lazy(() => import("./pages/farmer/FarmerDashboard"))
const MyClaims = lazy(() => import("./pages/farmer/MyClaims"))
const ApplyClaim = lazy(() => import("./pages/farmer/ApplyClaim"))

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))

import ProtectedRoute from "./routes/ProtectedRoute"
import AdminRoute from "./routes/AdminRoute"
import Layout from "./components/Layout"
import AdminAnalytics from "./pages/admin/AdminAnalytics"

function App() {
  return (
    <BrowserRouter>

      {/* Global toast container (ONLY ONCE) */}
      <Toaster position="top-right" />

      <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
        <Routes>
          {/* Farmer routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <FarmerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/claim"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyClaims />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/claim/apply"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApplyClaim />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <Layout>
                  <AdminAnalytics/>
                </Layout>
              </AdminRoute>
            }
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
