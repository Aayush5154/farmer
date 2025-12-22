import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"

import App from "./App"
import { store } from "./app/store"
import "./index.css"

// Clean up corrupted localStorage data on app start
try {
  const user = localStorage.getItem("user")
  const token = localStorage.getItem("token")
  
  // Remove corrupted data
  if (user === "undefined" || user === "null" || (user && !user.startsWith("{"))) {
    localStorage.removeItem("user")
  }
  if (token === "undefined" || token === "null") {
    localStorage.removeItem("token")
  }
} catch (error) {
  console.error("Error cleaning localStorage:", error)
  // Clear all auth data if there's an error
  localStorage.removeItem("user")
  localStorage.removeItem("token")
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
)
