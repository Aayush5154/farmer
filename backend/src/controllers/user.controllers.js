import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Farmer } from "../models/Farmer.models.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (farmerId) => {
  try {
    const farmer = await Farmer.findById(farmerId)

    const accessToken = farmer.generateAccessToken()
    const refreshToken = farmer.generateRefreshToken()

    farmer.refreshToken = refreshToken
    await farmer.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating tokens"
    )
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if ([name, email, password].some(f => !f?.trim())) {
    throw new ApiError(400, "All fields are required")
  }

  const existedFarmer = await Farmer.findOne({ email })
  if (existedFarmer) {
    throw new ApiError(409, "Farmer already exists")
  }

  const farmer = await Farmer.create({
    name,
    email,
    password
  })

  const createdFarmer = await Farmer.findById(farmer._id)
    .select("-password -refreshToken")

  if (!createdFarmer) {
    throw new ApiError(500, "Farmer registration failed")
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      createdFarmer,
      "Farmer registered successfully"
    )
  )
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required")
  }

  const farmer = await Farmer.findOne({ email })
  if (!farmer) {
    throw new ApiError(404, "Farmer not found")
  }

  const isPasswordValid = await farmer.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials")
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(farmer._id)

  const loggedInFarmer = await Farmer.findById(farmer._id)
    .select("-password -refreshToken")

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInFarmer,
          token: accessToken
        },
        "Login successful"
      )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await Farmer.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  )

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
      new ApiResponse(
        200,
        {},
        "Logged out successfully"
      )
    )
})


const refreshAceessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )

  const farmer = await Farmer.findById(decoded._id)

  if (
    !farmer ||
    farmer.refreshToken !== incomingRefreshToken
  ) {
    throw new ApiError(401, "Invalid refresh token")
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(farmer._id)

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAceessToken
}
