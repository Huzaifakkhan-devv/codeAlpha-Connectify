
const express = require("express");
const router = express.Router();

const {
    createPost,
    getFeed,
    getUserPosts,
    getSinglePost,
    updatePost,
    deletePost,
    toggleLike
} = require("../controllers/postController");

const protect = require("../middleware/auth");
const upload = require("../middleware/upload");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/feed", protect, asyncHandler(getFeed));
router.get("/user/:userId", protect, asyncHandler(getUserPosts));

router.post("/", protect, upload.single("image"), asyncHandler(createPost));

router.post("/:postId/like", protect, asyncHandler(toggleLike));

router.get("/:postId", protect, asyncHandler(getSinglePost));
router.put("/:postId", protect, upload.single("image"), asyncHandler(updatePost));
router.delete("/:postId", protect, asyncHandler(deletePost));

module.exports = router;
