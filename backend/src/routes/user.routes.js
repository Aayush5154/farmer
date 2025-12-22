import { Router } from "express"

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAceessToken
} from "../controllers/user.controllers.js"

import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
)

router.post("/login", loginUser)

router.post("/logout", verifyJWT, logoutUser)

router.post("/refresh-token", refreshAceessToken)

export default router
