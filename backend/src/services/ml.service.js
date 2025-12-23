import axios from "axios"

const ML_BASE_URL = "http://127.0.0.1:5000"
const BACKEND_BASE = "http://localhost:8000"

/**
 * Predict approved claim amount using ML
 * Returns: { amount, confidence }
 */
export const predictClaimAmount = async (payload) => {
  try {
    const res = await axios.post(`${ML_BASE_URL}/predict`, payload, {
      timeout: 5000
    })

    if (!res.data || res.data.predicted_amount == null) {
      return null
    }

    const amount = Math.round(res.data.predicted_amount)

    // 🔹 Confidence handling
    // If ML sends confidence → use it
    // Else → derive proxy confidence safely
    let confidence = res.data.confidence

    if (confidence == null) {
      // Proxy confidence logic (safe & deterministic)
      const diffRatio =
        Math.abs(amount - payload.expectedAmount) /
        Math.max(payload.expectedAmount, 1)

      if (diffRatio < 0.15) confidence = 0.9
      else if (diffRatio < 0.3) confidence = 0.7
      else confidence = 0.4
    }

    return {
      amount,
      confidence
    }
  } catch (err) {
    console.error("ML predict failed:", err.message)
    return null
  }
}

/**
 * Trigger ML retraining after every 3 approved claims
 * (UNCHANGED – already working)
 */
export const triggerMLTraining = async () => {
  try {
    const claimsRes = await axios.get(
      `${BACKEND_BASE}/internal/training-claims`
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

    console.log("ML TRAIN RESPONSE:", res.data)

    await axios.post(
      `${BACKEND_BASE}/internal/mark-trained`,
      { ids: claims.map(c => c._id) }
    )

  } catch (err) {
    console.error("❌ ML retrain failed:", err.response?.data || err.message)
  }
}
