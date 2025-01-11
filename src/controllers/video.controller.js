import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 5));
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
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video is not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
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
