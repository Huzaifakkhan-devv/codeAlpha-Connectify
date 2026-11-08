
const express = require("express");
const router = express.Router();

const {
    addComment,
    getComments,
    deleteComment
} = require("../controllers/commentController");

const protect = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/post/:postId", protect, asyncHandler(getComments));
router.post("/post/:postId", protect, asyncHandler(addComment));
router.delete("/:commentId", protect, asyncHandler(deleteComment));

module.exports = router;
