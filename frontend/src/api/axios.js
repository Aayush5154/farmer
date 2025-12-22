import axios from "axios"
import { store } from "../app/store"
import { logout } from "../features/auth/authSlice"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on token expiry / unauthorized
      store.dispatch(logout())
    }

    return Promise.reject(error)
  }
)

export default api
