import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


// CORS Configuration - Allow multiple localhost ports
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true)
      
      // Allow all localhost ports in development
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        process.env.CORS_ORIGIN
      ].filter(Boolean)
      
      // In development, allow any localhost origin
      if (process.env.NODE_ENV !== "production") {
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
          return callback(null, true)
        }
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use(express.static("public"))


app.use(cookieParser())


import userRouter from "./src/routes/user.routes.js"
import sensorRouter from "./src/routes/sensor.routes.js"
import claimRouter from "./src/routes/claim.routes.js"
import internalRoutes from "./src/routes/internal.routes.js"


app.use("/api/v1/user", userRouter)
app.use("/api/v1/sensor", sensorRouter)
app.use("/api/v1/claim", claimRouter)
app.use("/internal", internalRoutes)


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  })
})

export { app }
