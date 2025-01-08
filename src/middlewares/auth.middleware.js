import {asyncHandler} from "../utils/asyncHandler.js"
import  jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"


const verifyJwt = asyncHandler(async(req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(400,"Token not found")
        }
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded._id)
        if(!user){
            throw new ApiError(401,"You are not authorized")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})


export {
    verifyJwt
}