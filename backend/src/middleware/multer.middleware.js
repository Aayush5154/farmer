import multer from "multer"
import path from "path"

// Multer browser se aayi files ko server par temporary store karta hai
// aur unka data req.body aur req.files me attach kar deta hai

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      path.resolve(process.cwd(), "public/temp")
    )
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname
    cb(null, uniqueName)
  }
})

// Optional: file type validation (recommended)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true)
  } else {
    cb(
      new Error("Only image files are allowed"),
      false
    )
  }
}
//fileFilter is a function that decides which files are allowed to be uploaded and which are rejected.

// It runs before Multer saves the file.

export const upload = multer({
  storage,
  fileFilter
})
