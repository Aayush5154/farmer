// API error sirf ek structured format deta hai
// taaki frontend ko hamesha same type ka error mile

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message)

    this.statusCode = statusCode
    this.data = null
    this.success = false
    this.message = message
    this.errors = errors

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }

    Object.freeze(this) // 🔐 optional safety
  }
}

export { ApiError }
