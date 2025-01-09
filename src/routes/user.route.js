import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage, getChannelProfile, getWatchHistory } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.post("/login",loginUser)
router.post("/logout",verifyJwt,logoutUser)
router.post("/access-token",refreshAccessToken)


//update
router.post("/change-password",verifyJwt,changeCurrentPassword)
router.post("/get-current-user",verifyJwt,getCurrentUser)
router.post("/account-details",verifyJwt,updateAccountDetails)
router.post("/avatar",verifyJwt,upload.single('file'),updateUserAvatar)
router.post("/coverImage",verifyJwt,upload.single('coverImage',updateUserCoverImage))

router.get("/channel/:username", verifyJwt,getChannelProfile)
router.get("/watch-history",verifyJwt,getWatchHistory)

export default router;
