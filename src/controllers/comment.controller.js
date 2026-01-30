import mongoose,{isValidObjectId} from "mongoose";
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

// const mongoose = require("mongoose");

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 5));

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  try {
    // Convert videoId to ObjectId if needed
    const videoObjectId =  mongoose.Types.ObjectId.isValid(videoId)
      ? new mongoose.Types.ObjectId(videoId)
      : videoId;

    // Aggregation pipeline
    const myAggregate = Comment.aggregate([
      { $match: { video: videoObjectId } }, // Filter by video ID
      {
        $lookup: {
          from: "users", // Foreign collection
          localField: "owner", // Field in the Comment collection
          foreignField: "_id", // Field in the users collection
          as: "owner", // Output array field
          pipeline: [
            {
              $project: {
                username: 1, // Include only username
                avatar: 1, // Include only avatar
                _id: 0, // Exclude the _id field
              },
            },
          ],
        },
      },
      { $unwind: "$owner" }, // Flatten the owner array
      { $sort: { createdAt: -1 } }, // Sort by creation date descending
    ]);

    // Paginate the results
    const paginatedResults = await Comment.aggregatePaginate(myAggregate, {
      page,
      limit,
    });

    // Return the paginated results
    if (!paginatedResults) {
      throw new ApiError(404, "Comments not found for the specified video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, paginatedResults?.docs, "Comments fetched successfully"));
  } catch (error) {
    console.error("Error fetching comments:", error);
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
