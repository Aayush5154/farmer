import mongoose from "mongoose"

const sensorDataSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true
    },

    deviceId: {
      type: String,
      required: true
    },

    soilMoisture: {
      type: Number,
      required: true
    },

    airTemp: {
      type: Number,
      required: true
    },

    humidity: {
      type: Number,
      required: true
    },

    soilTemp: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

export const SensorData = mongoose.model("SensorData",sensorDataSchema)
