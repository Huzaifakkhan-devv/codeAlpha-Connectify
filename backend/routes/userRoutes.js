
const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    searchUsers,
    followUser,
    unfollowUser
} = require("../controllers/userController");

const protect = require("../middleware/auth");
const upload = require("../middleware/upload");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/search", protect, asyncHandler(searchUsers));
router.put("/me", protect, upload.single("avatar"), asyncHandler(updateProfile));

router.post("/:userId/follow", protect, asyncHandler(followUser));
router.delete("/:userId/follow", protect, asyncHandler(unfollowUser));

router.get("/:username", protect, asyncHandler(getProfile));

module.exports = router;
