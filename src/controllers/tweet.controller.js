import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"Content is required")
    }
    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })
    if(!tweet){
        throw new ApiError(500,"failed to create the tweet")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(201,"tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    console.log("inside getusertwwets");
    const userTweets = await Tweet.find({
        owner:req.user._id
    })
    console.log("after get");

    return res
    .status(200)
    .json(
        new ApiResponse(200,userTweets,"fetched user tweets successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content} = req.body
    const {tweetId} = req.params
    if(!content || !tweetId){
        throw new ApiError(400," fields are missing")
    }
    const updatedTweet = await Tweet.findOneAndUpdate(
        {_id:tweetId,owner:req.user._id},
        {content},
        {new:true}
    )
    if(!updatedTweet){
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"tweet not found")
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updateTweet,"tweet has been updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400," fields are missing")
    }
    const deletedTweet = await Tweet.findOneAndDelete({_id:tweetId,owner:req.user._id})
    if(!deletedTweet){
        throw new ApiError(400,"tweet not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"tweet has been deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}