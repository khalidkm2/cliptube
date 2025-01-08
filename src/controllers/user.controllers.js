import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body
    if (
        [username, email, password, fullname].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email: email }, { username: username }]
      });
      
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    let coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
        
    if (!req.files.avatar) {
        throw new ApiError(400, "avatar file is required")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        console.log(avatar);
        throw new ApiError(400, "avatar file is required cloud")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")

    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User regstered successfully")
    )


})




const generateRefresshAndAccessToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(401,"user not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"failed to genrate token")
    }
}

const loginUser = asyncHandler(async(req,res) => {
    const {username,email,password} = req.body
    if(!username || !email){
        throw new ApiError(401,"username or email is required",)
        if(!password){
            throw new ApiError(401,"password is required")
        }
    }
    const user = await User.findOne({
        $or:[{email},{password}]
    })
    if(!user){
        throw new ApiError(400,"User is not registered")
    }
    if(!user.isPassword(password)){
        throw new ApiError(402,"Password is incorrect")
    }
    const {accessToken,refreshToken} = await generateRefresshAndAccessToken(user._id)


    user.refreshToken = refreshToken
    const fieldsToExclude = ["password","refreshToken"]  
    const filteredUser = Object.entries(user).filter(([key,value]) => !fieldsToExclude.includes(key))

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(201).cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options).json(
        new ApiResponse(201,{user: filteredUser},"user logged in successfully")
    )

})

const logoutUser = asyncHandler(async(req,res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken: ""
                }
            },{
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .clear
})



export {
    registerUser,
    loginUser
}








//login
/*
login
-take data
-validate
-find
-compare
-generate token
-send

*/




/*
register
-validation
-check if user already exist
-create user (using methods,and create token,)
*/