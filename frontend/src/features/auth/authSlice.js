import { createSlice } from "@reduxjs/toolkit"

// Safely get and parse user from localStorage
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr || userStr === "undefined" || userStr === "null") {
      return null
    }
    return JSON.parse(userStr)
  } catch (error) {
    console.error("Error parsing user from localStorage:", error)
    localStorage.removeItem("user")
    return null
  }
}

const userFromStorage = getUserFromStorage()
const tokenFromStorage = localStorage.getItem("token")

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage && tokenFromStorage !== "undefined" ? tokenFromStorage : null,
  isAuthenticated: !!(tokenFromStorage && tokenFromStorage !== "undefined" && userFromStorage),
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true

      localStorage.setItem("user", JSON.stringify(action.payload.user))
      localStorage.setItem("token", action.payload.token)
    },

    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false

      localStorage.removeItem("user")
      localStorage.removeItem("token")
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
