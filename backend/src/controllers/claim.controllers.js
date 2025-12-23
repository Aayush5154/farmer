import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { InsuranceClaim } from "../models/InsuranceClaim.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { SensorData } from "../models/SensorData.models.js"
import { predictClaimAmount, triggerMLTraining } from "../services/ml.service.js"

// --------------------
// SENSOR THRESHOLDS
// --------------------
const SOIL_MOISTURE_LOW = 30
const AIR_TEMP_HIGH = 40
const HUMIDITY_LOW = 25
const SOIL_TEMP_HIGH = 35

// ====================
// APPLY FOR CLAIM
// ====================
const applyForClaim = asyncHandler(async (req, res) => {
  const { cropType, reason, expectedAmount, sensorDataId } = req.body

  if (!cropType || !reason || !expectedAmount) {
    throw new ApiError(400, "Crop type, reason and expected amount are required")
  }

  // IMAGE UPLOAD
  const imageLocalPath = req.file?.path
  if (!imageLocalPath) {
    throw new ApiError(400, "Damage image is required")
  }

  const uploadedImage = await uploadOnCloudinary(imageLocalPath)
  if (!uploadedImage) {
    throw new ApiError(500, "Image upload failed")
  }

  // SENSOR DATA
  let latestSensor = null
  if (sensorDataId) {
    latestSensor = await SensorData.findById(sensorDataId)
  }

  // RULE ENGINE
  let matchedConditions = 0
  let isBorderline = false

  if (latestSensor) {
    const { soilMoisture, airTemp, humidity, soilTemp } = latestSensor

    if (soilMoisture < SOIL_MOISTURE_LOW) matchedConditions++
    if (airTemp > AIR_TEMP_HIGH) matchedConditions++
    if (humidity < HUMIDITY_LOW) matchedConditions++
    if (soilTemp > SOIL_TEMP_HIGH) matchedConditions++

    isBorderline =
      (soilMoisture >= 28 && soilMoisture <= 32) ||
      (airTemp >= 38 && airTemp <= 40) ||
      (humidity >= 23 && humidity <= 27) ||
      (soilTemp >= 33 && soilTemp <= 35)
  }

  // ====================
  // CONFIDENCE (PART‑B)
  // ====================
  const confidenceScore = matchedConditions / 4 // 0 → 1
  const HIGH_CONFIDENCE_THRESHOLD = 0.75

  let autoStatus = "review"
  if (!latestSensor) autoStatus = "review"
  else if (confidenceScore >= HIGH_CONFIDENCE_THRESHOLD) autoStatus = "approved"
  else if (matchedConditions === 1 || isBorderline) autoStatus = "review"
  else autoStatus = "rejected"

  // ====================
  // AMOUNT LOGIC
  // ====================
  const expected = Number(expectedAmount)
  const MAX_PAYOUT = 500000

  let approvedAmount = 0
  let decisionSource = "RULE_ENGINE"
  let mlUsed = false

  if (autoStatus === "approved") {
    approvedAmount = confidenceScore >= 0.9 ? expected * 0.9 : expected * 0.6

    if (latestSensor) {
      try {
        const mlResult = await predictClaimAmount({
          cropType,
          soilMoisture: latestSensor.soilMoisture,
          airTemp: latestSensor.airTemp,
          humidity: latestSensor.humidity,
          soilTemp: latestSensor.soilTemp,
          expectedAmount: expected
        })

        if (mlResult?.amount != null && !isNaN(mlResult.amount)) {
          approvedAmount = mlResult.amount
          decisionSource = "ML_MODEL"
          mlUsed = true
        }
      } catch {}
    }

    // FINAL SAFETY RULES
    approvedAmount = Math.min(
      approvedAmount,
      expected,
      MAX_PAYOUT
    )
  }

  approvedAmount = Math.round(approvedAmount)

  // ====================
  // SAVE CLAIM
  // ====================
  const claim = await InsuranceClaim.create({
    farmerId: req.user._id,
    cropType,
    reason,
    expectedAmount: expected,
    approvedAmount,
    damageImage: uploadedImage.secure_url,
    sensorDataId: sensorDataId || null,

    autoStatus,
    status:
      autoStatus === "approved"
        ? "approved"
        : autoStatus === "rejected"
        ? "rejected"
        : "pending",

    decisionSource,
    mlUsed,
    usedForTraining: false,

    // ✅ STORED IN DB
    confidenceScore,

    history: [
      {
        action: "created",
        by: req.user._id,
        note: "Claim submitted by farmer"
      },
      {
        action:
          autoStatus === "approved"
            ? "auto_approved"
            : autoStatus === "rejected"
            ? "auto_rejected"
            : "sent_for_review",
        note: `System decision via ${decisionSource} (confidence=${confidenceScore.toFixed(
          2
        )})`
      }
    ]
  })

  // ====================
  // AUTO‑RETRAIN AFTER 3 APPROVED CLAIMS
  // ====================
  if (claim.status === "approved") {
    const trainingClaims = await InsuranceClaim.find({
      status: "approved",
      usedForTraining: false
    })
      .limit(3)
      .populate("sensorDataId")

    if (trainingClaims.length >= 3) {
      const payload = trainingClaims.map(c => ({
        soilMoisture: c.sensorDataId?.soilMoisture,
        airTemp: c.sensorDataId?.airTemp,
        humidity: c.sensorDataId?.humidity,
        soilTemp: c.sensorDataId?.soilTemp,
        expectedAmount: c.expectedAmount,
        approvedAmount: c.approvedAmount
      }))

      triggerMLTraining(payload)
        .then(async () => {
          await InsuranceClaim.updateMany(
            { _id: { $in: trainingClaims.map(c => c._id) } },
            { $set: { usedForTraining: true } }
          )
        })
        .catch(() => {})
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, claim, "Insurance claim submitted successfully"))
})

// ====================
// GET MY CLAIMS
// ====================
const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await InsuranceClaim.find({ farmerId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("sensorDataId")

  return res
    .status(200)
    .json(new ApiResponse(200, claims, "Your insurance claims fetched successfully"))
})

// ====================
// GET ALL CLAIMS (ADMIN)
// ====================
const getAllClaims = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied")
  }

  const claims = await InsuranceClaim.find()
    .populate("farmerId", "name email")
    .populate("approvedBy", "name email role")
    .populate("history.by", "name email role")
    .populate("sensorDataId")
    .sort({ createdAt: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, claims, "All insurance claims fetched"))
})

// ====================
// UPDATE CLAIM STATUS (ADMIN)
// ====================
const updateClaimStatus = asyncHandler(async (req, res) => {
  const { claimId } = req.params
  const { status, approvedAmount } = req.body

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied")
  }

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid claim status")
  }

  const claim = await InsuranceClaim.findById(claimId)
  if (!claim) {
    throw new ApiError(404, "Claim not found")
  }

  if (claim.status === "approved") {
    throw new ApiError(400, "Claim already approved")
  }

  claim.status = status
  claim.approvedBy = req.user._id
  claim.approvedAt = new Date()

  if (status === "approved") {
    if (claim.autoStatus === "review" && approvedAmount == null) {
      throw new ApiError(400, "approvedAmount is required for reviewed claims")
    }

    claim.approvedAmount = Number(approvedAmount || claim.approvedAmount || 0)
    claim.decisionSource = "ADMIN"
    claim.mlUsed = false
    claim.usedForTraining = false
  }

  claim.history.push({
    action: status,
    by: req.user._id,
    note: `Claim ${status} by admin`
  })

  await claim.save()

  return res
    .status(200)
    .json(new ApiResponse(200, claim, `Claim ${status} successfully`))
})

export {
  applyForClaim,
  getMyClaims,
  getAllClaims,
  updateClaimStatus
}
