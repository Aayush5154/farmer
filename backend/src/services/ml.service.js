import axios from "axios"

const ML_BASE_URL = "http://127.0.0.1:5000"
const BACKEND_BASE = "http://localhost:3000"

/**
 * Predict approved claim amount using ML
 */
export const predictClaimAmount = async (payload) => {
  try {
    const res = await axios.post(`${ML_BASE_URL}/predict`, payload, {
      timeout: 5000
    })

    if (!res.data || res.data.predicted_amount == null) {
      return null
    }

    return Math.round(res.data.predicted_amount)
  } catch (err) {
    console.error("ML predict failed:", err.message)
    return null
  }
}

/**
 * Trigger ML retraining after every 3 approved claims
 */
export const triggerMLTraining = async () => {
  try {
    const claimsRes = await axios.get(
      "http://localhost:8000/internal/training-claims"
    )

    const claims = claimsRes.data || []

    console.log("📦 Claims sent to ML:", claims.length)

    if (claims.length < 3) {
      console.log("⏭️ Not enough claims for training")
      return
    }

    const res = await axios.post(
      `${ML_BASE_URL}/train`,
      { claims }
    )

    console.log("🔥 ML TRAIN RESPONSE:", res.data)

    await axios.post(
      "http://localhost:8000/internal/mark-trained",
      { ids: claims.map(c => c._id) }
    )

  } catch (err) {
    console.error("❌ ML retrain failed:", err.response?.data || err.message)
  }
}
