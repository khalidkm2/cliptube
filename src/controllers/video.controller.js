import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

// const asyncHandler = require("express-async-handler");
// const Video = require("../models/videoModel"); // Adjust path as needed

const getAllVideos = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 5));
  const searchFilter = {};
  if (query) {
    searchFilter.title = { $regex: query, $options: "i" }; // Case-insensitive search on title
  }

  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  // Create aggregation pipeline
  const aggregationPipeline = [
    { $match: searchFilter },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    }, // Apply the search filter
    { $sort: sortOptions }, // Apply the sort order
    { $skip: (page - 1) * limit }, // Pagination - skip results based on page number
    { $limit: limit }, // Limit the number of results per page
  ];

  // Run the aggregation pipeline with pagination
  const options = {
    page,
    limit,
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    },
  };
  try {
    const result = await Video.aggregatePaginate(aggregationPipeline, options);

    res
      .status(200)
      .json(new ApiResponse(200, result, "successfully fetched all videos"));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }

  // res.status(200).json(result);
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "title and description are missing");
  }
  // TODO: get video, upload to cloudinary, create video
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new Error("No files were uploaded.");
  }
  // console.log(req.files);
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "both thumbnail file and video file are required");
  }

  const [videoResopnse, thumbnail] = await Promise.all([
    uploadOnCloudinary(videoLocalPath),
    uploadOnCloudinary(thumbnailLocalPath),
  ]);
  // console.log(videoResopnse,);
  // console.log(thumbnail)
  if (!videoResopnse?.url || !thumbnail?.url) {
    throw new ApiError(500, "Failed to upload files to Cloudinary");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoResopnse.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    duration: videoResopnse?.duration,
  });
  if (!video) {
    throw new ApiError(
      500,
      "Something went wrong while uploading the video details"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, video, "video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId is missing");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" }, // Count the number of likes
        isLiked: {
          $cond: {
            if: { $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"] }, // Match user ID
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        likes: 0, // Remove likes array if not needed in the final response
      },
    },
  ]);

  if (!video || video.length === 0) {
    throw new ApiError(400, "Video is not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});


const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }
  const video = await Video.findOneAndDelete({
    owner: req.user._id,
    _id: videoId,
  });
  if (!video) {
    throw new ApiError(400, "video is not found");
  }
  console.log("videourl", video.videoFile);
  console.log("thumnailurl", video.thumbnail);
  const responseVideo = await deleteOnCloudinary(video.videoFile);
  const responeThumnail = await deleteOnCloudinary(video.thumbnail);
  // console.log(result);
  if (
    responseVideo.result === "not found" ||
    responeThumnail.result === "not found"
  ) {
    console.log("failed to delete on cloudinary");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video has been deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }
  const video = await Video.findOne({ _id: videoId, owner: req.user._id });
  if (!video) {
    throw new Error("Video not found");
  }

  video.isPublished = !video.isPublished;
  const updatedVideo = await video.save();
  if (!updatedVideo) {
    throw new ApiError(400, "failed to toggle the video publish status");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        "publish status has been  successfully toggled"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
