import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Farmer } from "../models/Farmer.models.js"

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req
      .header("Authorization")
      ?.replace("Bearer ", "")

  if (!token) {
    throw new ApiError(401, "Unauthorized request")
  }
  

  const decodedToken = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET
  )

  const farmer = await Farmer.findById(decodedToken._id)
    .select("-password")

  if (!farmer) {
    throw new ApiError(401, "Invalid access token")
  }

  req.user = farmer
  console.log("AUTH USER:", req.user);

  next()
})


// Request
//  → verifyJWT
//      → token read
//      → jwt.verify
//      → Farmer fetched
//      → req.user attached
//  → controller
