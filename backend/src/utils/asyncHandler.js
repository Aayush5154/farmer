const asyncHandler = (requestHandler) => {return (req, res, next) => {
        Promise.resolve(requestHandler(req, res,next)).catch((err) => next(err))
    }
} // requesthandler likha ya fn ek hi baat h 
// bas ham promise retrun kar rahe h rather than putra execute karna ki jagah 

// chapter 8 part 
export {asyncHandler}  