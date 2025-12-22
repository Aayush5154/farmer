import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { SensorData } from "../models/SensorData.models.js"


const addSensorData = asyncHandler(async (req, res) => {
  const {
    deviceId,
    soilMoisture,
    airTemp,
    humidity,
    soilTemp
  } = req.body

  if (
    !deviceId ||
    soilMoisture === undefined ||
    airTemp === undefined ||
    humidity === undefined ||
    soilTemp === undefined
  ) {
    throw new ApiError(400, "All sensor fields are required")
  }

  const farmerId = req.user._id
  console.log("REQ BODY:", req.body);


  const sensorData = await SensorData.create({
    farmerId,
    deviceId,
    soilMoisture,
    airTemp,
    humidity,
    soilTemp
  })

  if (!sensorData) {
    throw new ApiError(500, "Failed to save sensor data")
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      sensorData,
      "Sensor data saved successfully"
    )
  )
})


const getMySensorData = asyncHandler(async (req, res) => {
  const farmerId = req.user._id

  const sensorData = await SensorData.find({ farmerId })
    .sort({ createdAt: -1 })

  return res.status(200).json(
    new ApiResponse(
      200,
      sensorData,
      "Sensor data fetched successfully"
    )
  )
})

const getSensorById = asyncHandler(async (req, res) => {
  const sensorId = req.params.id
  const sensor = await SensorData.findById(sensorId)

  if (!sensor) {
    throw new ApiError(404, "Sensor data not found")
  }

  // allow admin or owner
  if (req.user.role !== "admin" && sensor.farmerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied")
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      sensor,
      "Sensor data fetched successfully"
    )
  )
})

export {
  addSensorData,
  getMySensorData,
  getSensorById
}
