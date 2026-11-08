
const Comment = require("../models/comment");
const Post = require("../models/post");

exports.addComment = async (req, res) => {
    const text = (req.body.text || "").trim();

    if (!text) {
        return res.status(400).json({
            success: false,
            message: "Comment text is required"
        });
    }

    if (text.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "Comment cannot exceed 1000 characters"
        });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        });
    }

    const comment = await Comment.create({
        post: post._id,
        author: req.user._id,
        text
    });

    const result = await Comment.findById(comment._id)
        .populate("author", "name username avatar");

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        comment: result
    });
};

exports.getComments = async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        });
    }

    const comments = await Comment.find({
        post: req.params.postId
    })
        .populate("author", "name username avatar")
        .sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        comments
    });
};

exports.deleteComment = async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
        return res.status(404).json({
            success: false,
            message: "Comment not found"
        });
    }

    const post = await Post.findById(comment.post);

    const isCommentAuthor =
        comment.author.toString() === req.user._id.toString();

    const isPostAuthor = post &&
        post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to delete this comment"
        });
    }

    await comment.deleteOne();

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully"
    });
};
