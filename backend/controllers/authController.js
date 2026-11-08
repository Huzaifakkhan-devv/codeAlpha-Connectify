
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const createToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    followersCount: user.followers.length,
    followingCount: user.following.length
});

exports.register = async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
        return res.status(400).json({
            success: false,
            message: "Username must be 3-30 characters and contain only letters, numbers or underscores"
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid email address"
        });
    }

    const existingUser = await User.findOne({
        $or: [
            { email: normalizedEmail },
            { username: normalizedUsername }
        ]
    });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email or username already registered"
        });
    }

    const user = await User.create({
        name: name.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        password
    });

    const token = createToken(user._id);

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
        user: publicUser(user)
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const user = await User.findOne({
        email: email.toLowerCase().trim()
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const token = createToken(user._id);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: publicUser(user)
    });
};

exports.getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: publicUser(req.user)
    });
};
