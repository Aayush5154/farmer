import axios from "axios"

// ====================
// ML SERVICE CONFIG
// ====================
const ML_BASE_URL = "http://127.0.0.1:5000"
const ML_TIMEOUT = 5000

/**
 * Predict approved claim amount using trained ML model
 * Safe: never breaks claim flow
 */
export const predictClaimAmount = async (payload) => {
  try {
    const response = await axios.post(
      `${ML_BASE_URL}/predict`,
      payload,
      {
        timeout: ML_TIMEOUT,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )

    const predicted = response.data?.predicted_amount

    if (typeof predicted !== "number" || Number.isNaN(predicted)) {
      throw new Error("Invalid ML response")
    }

    return Math.round(predicted)
  } catch (error) {
    console.error("[ML] Prediction failed:", error.message)
    return null // fallback → rule engine
  }
}

/**
 * Trigger ML retraining
 * Called AFTER every 3 new claims
 */
export const triggerMLTraining = async () => {
  try {
    await axios.post(`${ML_BASE_URL}/train`, {}, { timeout: 10000 })
    console.log("[ML] Training triggered successfully")
    return true
  } catch (error) {
    console.error("[ML] Training trigger failed:", error.message)
    return false
  }
}
