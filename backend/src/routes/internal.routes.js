// routes/internal.routes.js
import express from "express"
import { InsuranceClaim } from "../models/InsuranceClaim.models.js"

const router = express.Router()

router.get("/training-claims", async (req, res) => {
  const claims = await InsuranceClaim.find({
    status: "approved",
    usedForTraining: false,
    approvedAmount: { $gt: 0 },
    sensorDataId: { $ne: null }
  })
  .populate("sensorDataId")
  .limit(3)

  const formatted = claims.map(c => ({
    soilMoisture: c.sensorDataId.soilMoisture,
    airTemp: c.sensorDataId.airTemp,
    humidity: c.sensorDataId.humidity,
    soilTemp: c.sensorDataId.soilTemp,
    expectedAmount: c.expectedAmount,
    approvedAmount: c.approvedAmount,
    _id: c._id
  }))

  res.json(formatted)
})

router.post("/mark-trained", async (req, res) => {
  const { ids } = req.body
  await InsuranceClaim.updateMany(
    { _id: { $in: ids } },
    { $set: { usedForTraining: true } }
  )
  res.json({ status: "ok" })
})

export default router
