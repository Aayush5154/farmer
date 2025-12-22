import { Router } from "express"
import {addSensorData, getMySensorData, getSensorById} from "../controllers/sensor.controllers.js"

import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()


router.post("/add", verifyJWT, addSensorData)
router.get("/my", verifyJWT, getMySensorData)
router.get("/:id", verifyJWT, getSensorById)

export default router
