
const Post = require("../models/post");
const Comment = require("../models/comment");

const populatePost = (query) => {
    return query.populate("author", "name username avatar");
};

exports.createPost = async (req, res) => {
    const content = (req.body.content || "").trim();

    if (!content && !req.file) {
        return res.status(400).json({
            success: false,
            message: "A post must contain text or an image"
        });
    }

    const post = await Post.create({
        author: req.user._id,
        content,
        image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    const result = await populatePost(
        Post.findById(post._id)
    );

    res.status(201).json({
        success: true,
        message: "Post created successfully",
        post: result
    });
};

exports.getFeed = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit) || 10)
    );

    const posts = await populatePost(
        Post.find()
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
    );

    const total = await Post.countDocuments();

    res.status(200).json({
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        posts
    });
};

exports.getUserPosts = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit) || 10)
    );

    const posts = await populatePost(
        Post.find({ author: req.params.userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
    );

    res.status(200).json({
        success: true,
        posts
    });
};

exports.getSinglePost = async (req, res) => {
    const post = await populatePost(
        Post.findById(req.params.postId)
    );

    if (!post) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        });
    }

    res.status(200).json({
        success: true,
        post
    });
};

exports.updatePost = async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        });
    }

    if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You can only edit your own posts"
        });
    }

    if (req.body.content !== undefined) {
        const content = req.body.content.trim();

        if (!content && !post.image && !req.file) {
            return res.status(400).json({
                success: false,
                message: "Post cannot be empty"
            });
        }

        post.content = content;
    }

    if (req.file) {
        post.image = `/uploads/${req.file.filename}`;
    }

    await post.save();

    const result = await populatePost(
        Post.findById(post._id)
    );

    res.status(200).json({
        success: true,
        message: "Post updated successfully",
        post: result
    });
};

exports.deletePost = async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        });
    }

    if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You can only delete your own posts"
        });
    }

    await Promise.all([
        Post.findByIdAndDelete(post._id),
        Comment.deleteMany({ post: post._id })
    ]);

    res.status(200).json({
        success: true,
        message: "Post and its comments deleted successfully"
    });
};

exports.toggleLike = async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(
        id => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
        await Post.updateOne(
            { _id: post._id },
            { $pull: { likes: userId } }
        );
    } else {
        await Post.updateOne(
            { _id: post._id },
            { $addToSet: { likes: userId } }
        );
    }

    const updatedPost = await Post.findById(post._id);

    res.status(200).json({
        success: true,
        liked: !alreadyLiked,
        likesCount: updatedPost.likes.length,
        message: alreadyLiked ? "Post unliked" : "Post liked"
    });
};
