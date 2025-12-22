import dotenv from "dotenv"
import connectDB from "./src/config/db.js"
import { app } from "./app.js"

// Load environment variables ASAP
dotenv.config({
  path: "./.env"
})

// Connect DB & start server
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("❌ Server Error:", error)
      throw error
    })

    const PORT = process.env.PORT || 8000

    app.listen(PORT, () => {
      console.log(`Server is running at port : ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MONGODB connection failed !!:", err)
  })
