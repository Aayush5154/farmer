import mongoose from "mongoose"

const insuranceClaimSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true
    },

    cropType: {
      type: String,
      required: true,
      trim: true
    },

    reason: {
      type: String,
      required: true,
      trim: true
    },

    damageImage: {
      type: String, // Cloudinary URL
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    approvedAmount: {
      type: Number,
      default: 0
    },

    approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer" // admin is also a Farmer with role=admin
    },

    sensorDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SensorData",
      default: null
    },

    history: [
    {
      action: {
        type: String,
        enum: [
          "created",
          "auto_approved",
          "auto_rejected",
          "sent_for_review",
          "approved",
          "rejected"
        ],
        required: true
      },
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Farmer", // farmer or admin
        default: null
      },
      at: {
        type: Date,
        default: Date.now
      },
      note: {
        type: String,
        default: ""
      }
    }
  ],
  expectedAmount: {
    type: Number,
    required: true
  },

  },
  { timestamps: true }
)

export const InsuranceClaim = mongoose.model("InsuranceClaim",insuranceClaimSchema)
