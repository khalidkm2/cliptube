import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!name) {
    throw new ApiError(400, "name is required");
  }
  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user._id,
  });
  if (!playlist) {
    throw new ApiError(500, "failed to create a playlist");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "user id is missing");
  }
  //TODO: get user playlists ======>
  const playlists = await Playlist.find({ owner: userId }).populate('videos');
  if (!playlists) {
    throw new ApiError(400, "playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if(!playlistId){
    throw new ApiError(400,"playlist id is missing")
  }
  const playlist = await Playlist.findById(playlistId).populate("videos")
  if(!playlist){
    throw new ApiError(400,"playlist not found")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,playlist,"playlist has been fetched successfully")
  )
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "all field are required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID format");
  }

  // Check if the video exists in the database
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } }, // Add only if the ID is not already in the array
    { new: true, useFindAndModify: false }
  );
  if(!playlist){
    throw new ApiError(400,"playlist not found")
  }
  return res
  .status(201)
  .json(
    new ApiResponse(201,playlist,"video is successfully added to playlist")
  )
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "All fields are required");
  }
  
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID format");
  }
  
  // Check if the playlist exists in the database
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } }, // Remove the video ID from the array
    { new: true, useFindAndModify: false }
  );
  
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video successfully removed from the playlist")
    );
  
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if(!playlistId){
    throw new ApiError(400,"playlist id is missing")
  }
  const playlist = await Playlist.findbyIdAndDelete(playlistId)
  if(!playlist){
    throw new ApiError(400,"playlist not found")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,{},"playlist deleted successfully")
  )
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId){
    throw new ApiError(400,"playlist id is missing")
  }
  if(!name || !description){
    throw new ApiError(400,"fields are missing")
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set:{name,description}
    },
    {new:true}
  )
  if(!updatedPlaylist){
    throw new ApiError(400,"playlist not found")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,updatedPlaylist,"playlist has been updated successfully")
  )
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
