import axios from "axios"
import { InsuranceClaim } from "../models/InsuranceClaim.models.js"

const ML_BASE_URL = "http://127.0.0.1:5000"

export const triggerMLTraining = async () => {
  try {
    // 1️⃣ Fetch approved claims not used for training
    const claims = await InsuranceClaim.find({
      status: "approved",
      usedForTraining: false
    })
      .populate("sensorDataId")
      .limit(3)

    if (claims.length < 3) {
      console.log("⏭️ Not enough claims for training")
      return
    }

    // 2️⃣ Convert to ML payload
    const payload = claims.map(c => ({
      soilMoisture: c.sensorDataId?.soilMoisture,
      airTemp: c.sensorDataId?.airTemp,
      humidity: c.sensorDataId?.humidity,
      soilTemp: c.sensorDataId?.soilTemp,
      expectedAmount: c.expectedAmount,
      approvedAmount: c.approvedAmount
    }))

    // 3️⃣ Call ML service
    await axios.post(`${ML_BASE_URL}/train`, {
      claims: payload
    })

    // 4️⃣ Mark claims as used
    await InsuranceClaim.updateMany(
      { _id: { $in: claims.map(c => c._id) } },
      { $set: { usedForTraining: true } }
    )

    console.log("🔥 ML retrained with", payload.length, "claims")

  } catch (err) {
    console.error("❌ ML retraining failed:", err.message)
  }
}
