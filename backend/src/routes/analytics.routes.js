import { Router } from "express"
import { getAdminAnalytics } from "../controllers/analytics.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.get("/admin", verifyJWT, getAdminAnalytics)

export default router
