import { Router } from "express"
import {
  applyForClaim,
  getMyClaims,
  getAllClaims,
  updateClaimStatus
} from "../controllers/claim.controllers.js"

import { verifyJWT } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js"

const router = Router()

router.post(
  "/apply",
  verifyJWT,
  upload.single("damageImage"),
  applyForClaim
)

router.get(
  "/my",
  verifyJWT,
  getMyClaims
)

router.get(
  "/all",
  verifyJWT,
  getAllClaims
)


router.patch(
  "/:claimId",
  verifyJWT,
  updateClaimStatus
)

export default router
