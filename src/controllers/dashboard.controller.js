import mongoose, { Mongoose } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelStats = await Video.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId), // Match videos by channel owner (userId)
          },
        },
        {
          $group: {
            _id: "$owner", // Group by channel ID
            totalViews: { $sum: "$views" }, // Sum all video views
            totalVideos: { $sum: 1 }, // Count total videos
            // totalLikes: { $sum: "$likes" }, // Sum likes if likes are stored in video documents
          },
        },
        {
          $lookup: {
            from: "subscriptions", // Join with subscriptions collection
            localField: "_id", // _id is the channel ID
            foreignField: "channel", // Match channel in subscriptions
            as: "subscribers", // Output array of matching subscription documents
          },
        },
        {
          $addFields: {
            totalSubscribers: { $size: "$subscribers" }, // Count total subscribers
          },
        },
        {
          $project: {
            // _id: 0, // Exclude channel ID from the final output
            totalViews: 1,
            totalVideos: 1,
            // totalLikes: 1,
            totalSubscribers: 1,
          },
        },
      ]);
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find({owner:req.user._id})
    if(!videos){
        return res.status(200).json(new ApiResponse(200,videos,"user has not uploaded any video"))
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"successfully fetched all videos from the channel")
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }