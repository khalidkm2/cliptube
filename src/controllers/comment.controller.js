import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// const comments = await Video.aggregate([
//     {
//         $match:{
//             _id: new mongoose.Types.ObjectId(videoId)
//         }
//     },
//     {
//         $lookup:{
//             from: "comments",
//             localField: "_id",
//             foreignField:"video",
//             as:"comments"
//         }
//     }
// ])

// if(!comments)

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 5));
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  try {
    const myAggregate = await Comment.aggregate([
      { $match: { video: videoId } }, // Filter by video ID
      { $sort: { createdAt: -1 } }, // Optional: Sort by creation date
    ]);

    // Paginate the results
    // console.log("myaggreage   :",myAggregate);
    const paginatedResults = await Comment.aggregatePaginate(myAggregate, {
      page,
      limit,
    });
    // console.log("paginatedresults  : ", paginatedResults);
    if (!paginatedResults) {
      throw new ApiError(400, "comments not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, paginatedResults.docs, "comments fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "An error occurred while fetching comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;
  if (!content || !videoId) {
    throw new ApiError(400, "content and videoId are required");
  }
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });
  if (!comment) {
    throw new ApiError(500, "failed to add comment");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { content } = req.body;
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "commentId is missing");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content: content },
    },
    {
      new: true,
    }
  );
  if (!updatedComment) {
    throw new ApiError(400, "comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "commentId is missing");
  }
  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) {
    throw new ApiError(400, "comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
