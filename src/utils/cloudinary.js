import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});




const deleteOnCloudinary = async(cloudinaryUrl) => {
  try {
    const parts = cloudinaryUrl.split("/");
    const fileName = parts[parts.length - 1];
    const [publicId, extension] = fileName.split(".");

    console.log("Public ID:", publicId);
    console.log("Extension:", extension);

    let resourceType = "image"; // Default to image
    if (["mp4", "mov", "avi", "mkv"].includes(extension.toLowerCase())) {
      resourceType = "video";
    }

    // Delete the resource from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Image deleted successfully:", result);
    return result
} catch(error){
  console.log(error);
  return null

}
}

const uploadOnCloudinary = async (localFilePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File is uploaded to cloudinary", response.url);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath); // remove the locally save file
    return null;
  }
};


export {uploadOnCloudinary,deleteOnCloudinary}