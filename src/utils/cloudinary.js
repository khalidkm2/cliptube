import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});




const deleteOnCloudinary = async(cloudinaryUrl) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("delete on cloudinary");
    const parts = cloudinaryUrl.split("/");
    const publicId = parts[parts.length - 1].split(".")[0];
    console.log(publicId);
    const result = await cloudinary.uploader.destroy(publicId);
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