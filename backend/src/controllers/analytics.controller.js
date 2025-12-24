import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { InsuranceClaim } from "../models/InsuranceClaim.models.js"

const MAX_PAYOUT = 500000 // ₹5 lakh cap (India-wide)

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied")
  }

  // Aggregate claim stats
  const stats = await InsuranceClaim.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ])

  const totalClaims = await InsuranceClaim.countDocuments()

  const statusMap = {
    pending: 0,
    approved: 0,
    rejected: 0
  }

  stats.forEach(s => {
    statusMap[s._id] = s.count
  })

  // Approved payout analytics
  const payoutStats = await InsuranceClaim.aggregate([
    { $match: { status: "approved" } },
    {
      $group: {
        _id: null,
        totalPayout: { $sum: "$approvedAmount" },
        avgPayout: { $avg: "$approvedAmount" },
        cappedClaims: {
          $sum: {
            $cond: [{ $gte: ["$approvedAmount", MAX_PAYOUT] }, 1, 0]
          }
        }
      }
    }
  ])

  const payout = payoutStats[0] || {
    totalPayout: 0,
    avgPayout: 0,
    cappedClaims: 0
  }

  return res.status(200).json(
    new ApiResponse(200, {
      totalClaims,
      pending: statusMap.pending,
      approved: statusMap.approved,
      rejected: statusMap.rejected,

      // Feature‑A analytics
      maxCap: MAX_PAYOUT,
      totalPayout: Math.round(payout.totalPayout),
      avgPayout: Math.round(payout.avgPayout),
      cappedClaims: payout.cappedClaims
    }, "Admin analytics fetched successfully")
  )
})
