import mongoose, { isValidObjectId, Mongoose } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // check video exists
  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    // Unlike the video
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unliked the video successfully"));
  } else {
    // Like the video
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Failed to like the video");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Liked the video successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  //   const { videoId } = req.params;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // check video exists
  const commentExists = await Comment.findById(commentId);
  if (!commentExists) {
    throw new ApiError(404, "comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    // Unlike the video
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unliked the comment successfully"));
  } else {
    // Like the video
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Failed to like the comment");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Liked the comment successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // check video exists
  const tweetExists = await Tweet.findById(tweetId);
  if (!tweetExists) {
    throw new ApiError(404, "tweet not found");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    // Unlike the video
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unliked the tweet successfully"));
  } else {
    // Like the video
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Failed to like the tweet");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Liked the tweet successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
try {
  const videos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id), // Match likes by the user
      },
    },
    {
      $lookup: {
        from: "videos",          
        localField: "video",     
        foreignField: "_id",    
        as: "likedVideos",      
      },
    },
    {
      $unwind: "$likedVideos",   // Flatten the `likedVideos` array
    },
    {
      $replaceRoot: {
        newRoot: "$likedVideos", // Replace the document root with `likedVideos`
      },
    },
  ]);
  
      return res
      .status(200)
      .json(
        new ApiResponse(200,videos,"liked videos has been fetched successfully")
      )
} catch (error) {
    throw new ApiError(500,error.message || "failed to fetch liked videos")
}
  
});

const getLikeCount = asyncHandler(async(req,res) => {
  const {videoId} = req.params
  if(!videoId || !isValidObjectId(videoId)){
    throw new ApiError(400,"invalid video id")
  }
  const like = await Like.find({where:{video:videoId}})
  if(!like){
    return res.status(400).json(new ApiResponse(400,{},"no like found"))
  }
  console.log(like);
  return res.status(200).json(new ApiResponse(200,like,"like fetched successfully"))
})

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos,getLikeCount };
