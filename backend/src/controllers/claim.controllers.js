import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { InsuranceClaim } from "../models/InsuranceClaim.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { SensorData } from "../models/SensorData.models.js"
import { predictClaimAmount } from "../services/ml.service.js"

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

  // --------------------
  // IMAGE UPLOAD
  // --------------------
  const imageLocalPath = req.file?.path
  if (!imageLocalPath) {
    throw new ApiError(400, "Damage image is required")
  }

  const uploadedImage = await uploadOnCloudinary(imageLocalPath)
  if (!uploadedImage) {
    throw new ApiError(500, "Image upload failed")
  }

  // --------------------
  // SENSOR DATA
  // --------------------
  let latestSensor = null
  if (sensorDataId) {
    latestSensor = await SensorData.findById(sensorDataId)
  }

  // --------------------
  // RULE ENGINE
  // --------------------
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

  // --------------------
  // AUTO DECISION
  // --------------------
  let autoStatus = "review"

  if (!latestSensor) {
    autoStatus = "review"
  } else if (matchedConditions >= 2) {
    autoStatus = "approved"
  } else if (matchedConditions === 1 || isBorderline) {
    autoStatus = "review"
  } else {
    autoStatus = "rejected"
  }

  // --------------------
  // AMOUNT LOGIC
  // --------------------
  const expected = Number(expectedAmount)
  let approvedAmount = 0
  let decisionSource = "RULE_ENGINE"
  let mlUsed = false

  if (autoStatus === "approved") {
    // Rule-based fallback
    approvedAmount =
      matchedConditions >= 3 ? expected * 0.9 : expected * 0.6

    // ---------- ML PREDICTION ----------
    if (latestSensor) {
      try {
        const mlAmount = await predictClaimAmount({
          cropType,
          soilMoisture: latestSensor.soilMoisture,
          airTemp: latestSensor.airTemp,
          humidity: latestSensor.humidity,
          soilTemp: latestSensor.soilTemp,
          expectedAmount: expected
        })

        if (mlAmount !== null && !isNaN(mlAmount)) {
          approvedAmount = mlAmount
          decisionSource = "ML_MODEL"
          mlUsed = true
        }
      } catch (err) {
        // ML failure should never break claim flow
        decisionSource = "RULE_ENGINE"
        mlUsed = false
      }
    }
  }

  approvedAmount = Math.round(approvedAmount)

  // --------------------
  // SAVE CLAIM
  // --------------------
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
        note: `System decision via ${decisionSource}`
      }
    ]
  })

  return res.status(201).json(
    new ApiResponse(201, claim, "Insurance claim submitted successfully")
  )
})

// ====================
// GET MY CLAIMS
// ====================
const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await InsuranceClaim.find({
    farmerId: req.user._id
  })
    .sort({ createdAt: -1 })
    .populate("sensorDataId")

  return res.status(200).json(
    new ApiResponse(200, claims, "Your insurance claims fetched successfully")
  )
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

  return res.status(200).json(
    new ApiResponse(200, claims, "All insurance claims fetched")
  )
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
    claim.approvedAmount = Number(
      approvedAmount || claim.approvedAmount
    )
  }

  claim.history.push({
    action: status,
    by: req.user._id,
    note: `Claim ${status} by admin`
  })

  await claim.save()

  return res.status(200).json(
    new ApiResponse(200, claim, `Claim ${status} successfully`)
  )
})

export {
  applyForClaim,
  getMyClaims,
  getAllClaims,
  updateClaimStatus
}
