import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { InsuranceClaim } from "../models/InsuranceClaim.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { SensorData } from "../models/SensorData.models.js"


// Sensor thresholds (can be tuned later)
const SOIL_MOISTURE_LOW = 30
const AIR_TEMP_HIGH = 40
const HUMIDITY_LOW = 25
const SOIL_TEMP_HIGH = 35

const applyForClaim = asyncHandler(async (req, res) => {
  const { cropType, reason, sensorDataId } = req.body

  if (!cropType || !reason) {
    throw new ApiError(400, "Crop type and reason are required")
  }

  const imageLocalPath = req.file?.path
  if (!imageLocalPath) {
    throw new ApiError(400, "Damage image is required")
  }

  const uploadedImage = await uploadOnCloudinary(imageLocalPath)
  if (!uploadedImage) {
    throw new ApiError(500, "Image upload failed")
  }
  let latestSensor = null

  if (sensorDataId) {
    latestSensor = await SensorData.findById(sensorDataId)
  }

  let matchedConditions = 0

  if (latestSensor) {
    const { soilMoisture, airTemp, humidity, soilTemp } = latestSensor

    if (soilMoisture < SOIL_MOISTURE_LOW) matchedConditions++
    if (airTemp > AIR_TEMP_HIGH) matchedConditions++
    if (humidity < HUMIDITY_LOW) matchedConditions++
    if (soilTemp > SOIL_TEMP_HIGH) matchedConditions++
  }

  let isBorderline = false

  if (latestSensor) {
    const { soilMoisture, airTemp, humidity, soilTemp } = latestSensor

    isBorderline =
      (soilMoisture >= 28 && soilMoisture <= 32) ||
      (airTemp >= 38 && airTemp <= 40) ||
      (humidity >= 23 && humidity <= 27) ||
      (soilTemp >= 33 && soilTemp <= 35)
  }

  let autoStatus = "review"

  if (!latestSensor) {
    autoStatus = "review"
  } 
  else if (matchedConditions >= 2) {
    autoStatus = "approved"
  } 
  else if (matchedConditions === 1 || isBorderline) {
    autoStatus = "review"
  } 
  else {
    autoStatus = "rejected"
  }

  const claim = await InsuranceClaim.create({
  farmerId: req.user._id,
  cropType,
  reason,
  damageImage: uploadedImage.secure_url,
  sensorDataId: sensorDataId || null,
  autoStatus,
  status:
    autoStatus === "approved"
      ? "approved"
      : autoStatus === "rejected"
      ? "rejected"
      : "pending",

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
        note: "System auto decision based on sensor data"
      }
    ]
  })


    console.log("AUTO CLAIM RESULT:", {
    matchedConditions,
    autoStatus
  })
  
  return res.status(201).json(
    new ApiResponse(
        201,
        claim,
        "Insurance claim submitted successfully"
      )
    )
  })


const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await InsuranceClaim.find({
    farmerId: req.user._id
  })
    .sort({ createdAt: -1 })
    .populate("sensorDataId")

  return res.status(200).json(
    new ApiResponse(
      200,
      claims,
      "Your insurance claims fetched successfully"
    )
  )
})

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
    new ApiResponse(
      200,
      claims,
      "All insurance claims fetched"
    )
  )
})

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

  claim.history.push({
    action: status, // "approved" or "rejected"
    by: req.user._id,
    note: `Claim ${status} by admin`
  })

  if (status === "approved") {
    claim.approvedAmount = approvedAmount || 0
  }

  await claim.save()

  return res.status(200).json(
    new ApiResponse(
      200,
      claim,
      `Claim ${status} successfully`
    )
  )
})


export {
  applyForClaim,
  getMyClaims,
  getAllClaims,
  updateClaimStatus
}
