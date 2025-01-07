import {asyncHandler} from "../utils/asyncHandler.js" 
import {ApiError} from "../utils/ApiError.js"
import {User} from "../model/user.model.Schema"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async(req,res)=>{
    const {username,email,password,fullname} = req.body
    if(
        [username,email,password,fullname].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    
    const existedUser =  User.findOne({
        $or:[{email,password,}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar file is required")
    }

    const user =  await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")

    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User regstered successfully")
    )


})


export {
    registerUser
}



/*
-validation
-check if user already exist
-create user (using methods,and create token,)
*/