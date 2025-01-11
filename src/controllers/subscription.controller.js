import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log("channelId",channelId);
  console.log("userId",req.user._id);
  // TODO: toggle subscription
  if (!channelId) {
    throw new ApiError(400, "channelId is missing");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channelId is not valid");
  }
  if (channelId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "cannot subscribe to own channel");
  }
  const channelExists = await User.findById(channelId);
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });
  if (existingSubscription) {
    // If subscription exists, delete it (unsubscribe)
    await existingSubscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed from the channel"));
  }
  const subscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subscription, "Subscribed to the channel"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "channel id is missing");
  }
   if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channelId is not valid");
  }
  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              _id: 1, // Include if you need the subscriber's ID
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$channel", // Group by channel
        subscribers: { $push: "$subscribers" }, // Push all subscribers into an array
      },
    },
    {
      $project: {
        _id: 0, // Exclude the `_id` field from the final result
        channelId: "$_id", // Include channel ID
        subscribers: {
          $reduce: {
            input: "$subscribers", // Flatten the nested subscribers array
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  ]);

  console.log(channelSubscribers);
  return res.json(new ApiResponse(200,channelSubscribers,"successfully get channel subscribers"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  // const { subscriberId } = req.params;
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "channel id is missing");
  }
   if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channelId is not valid");
  }
  const subscribedChannels = await Subscription.aggregate([
    {
      $match:{
        subscriber:new mongoose.Types.ObjectId(channelId),
      }
    },
    {
      $lookup:{
        from:"users",
        localField:"channel",
        foreignField:"_id",
        as:"subscribedTo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname:1,
              avatar: 1,
            },
          },
        ],
      }
    },
    {
      $group: {
        _id: "$subscriber", // Group by channel
        subscribedTo: { $push: "$subscribedTo" }, // Push all subscribers into an array
      },
    },
    {
      $project: {
        _id: 0, // Exclude the `_id` field from the final result
        channelId: "$_id", // Include channel ID
        subscribedTo: {
          $reduce: {
            input: "$subscribedTo", // Flatten the nested subscribers array
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  ])
  if(!subscribedChannels){
    throw new ApiError(200,"you have not subscribed to any channel")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,subscribedChannels,"subscribed channel fetched successfully")
  )
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
