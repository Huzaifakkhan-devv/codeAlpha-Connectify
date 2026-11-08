
const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];

        return res.status(409).json({
            success: false,
            message: `${field || "Value"} already exists`
        });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid resource ID"
        });
    }

    if (err instanceof require("multer").MulterError) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error"
    });
};

module.exports = errorHandler;
