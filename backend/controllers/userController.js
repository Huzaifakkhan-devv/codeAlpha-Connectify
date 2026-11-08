
const User = require("../models/user");

const profileData = (user, currentUserId) => ({
    id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    isFollowing: currentUserId
        ? user.followers.some(
            id => id.toString() === currentUserId.toString()
        )
        : false
});

exports.getProfile = async (req, res) => {
    const user = await User.findOne({
        username: req.params.username.toLowerCase()
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        user: profileData(user, req.user?._id)
    });
};

exports.updateProfile = async (req, res) => {
    const { name, bio } = req.body;

    if (name !== undefined) {
        if (!name.trim() || name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Name must contain 1-50 characters"
            });
        }

        req.user.name = name.trim();
    }

    if (bio !== undefined) {
        if (bio.length > 250) {
            return res.status(400).json({
                success: false,
                message: "Bio cannot exceed 250 characters"
            });
        }

        req.user.bio = bio.trim();
    }

    if (req.file) {
        req.user.avatar = `/uploads/${req.file.filename}`;
    }

    await req.user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: profileData(req.user, req.user._id)
    });
};

exports.searchUsers = async (req, res) => {
    const q = (req.query.q || "").trim();

    if (!q) {
        return res.status(200).json({
            success: true,
            users: []
        });
    }

    const users = await User.find({
        $or: [
            { username: { $regex: q, $options: "i" } },
            { name: { $regex: q, $options: "i" } }
        ]
    })
        .select("name username bio avatar")
        .limit(20);

    res.status(200).json({
        success: true,
        users
    });
};

exports.followUser = async (req, res) => {
    const targetId = req.params.userId;
    const currentId = req.user._id;

    if (targetId === currentId.toString()) {
        return res.status(400).json({
            success: false,
            message: "You cannot follow yourself"
        });
    }

    const targetUser = await User.findById(targetId);

    if (!targetUser) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    await Promise.all([
        User.updateOne(
            { _id: currentId },
            { $addToSet: { following: targetId } }
        ),
        User.updateOne(
            { _id: targetId },
            { $addToSet: { followers: currentId } }
        )
    ]);

    res.status(200).json({
        success: true,
        message: "User followed successfully"
    });
};

exports.unfollowUser = async (req, res) => {
    const targetId = req.params.userId;
    const currentId = req.user._id;

    if (targetId === currentId.toString()) {
        return res.status(400).json({
            success: false,
            message: "Invalid follow request"
        });
    }

    await Promise.all([
        User.updateOne(
            { _id: currentId },
            { $pull: { following: targetId } }
        ),
        User.updateOne(
            { _id: targetId },
            { $pull: { followers: currentId } }
        )
    ]);

    res.status(200).json({
        success: true,
        message: "User unfollowed successfully"
    });
};
