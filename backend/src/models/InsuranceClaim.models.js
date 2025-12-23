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

    // ===== CLAIM STATUS =====
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    autoStatus: {
      type: String,
      enum: ["approved", "rejected", "review"],
      default: "review"
    },

    // ===== AMOUNTS =====
    expectedAmount: {
      type: Number,
      required: true
    },

    approvedAmount: {
      type: Number,
      default: 0
    },

    // ===== ADMIN ACTION =====
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer" // admin is also a Farmer with role=admin
    },

    approvedAt: {
      type: Date,
      default: null
    },

    // ===== DECISION SOURCE =====
    decisionSource: {
      type: String,
      enum: ["RULE_ENGINE", "ML_MODEL", "ADMIN"],
      default: "RULE_ENGINE"
    },

    // ===== ML FLAGS =====
    mlUsed: {
      type: Boolean,
      default: false
    },

    usedForTraining: {
      type: Boolean,
      default: false
    },

    // ===== SENSOR DATA =====
    sensorDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SensorData",
      default: null
    },

    // ===== HISTORY =====
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
    ]
  },
  { timestamps: true }
)

export const InsuranceClaim = mongoose.model(
  "InsuranceClaim",
  insuranceClaimSchema
)
