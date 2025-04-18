/**
 * Empty session middleware that just passes through requests
 * We've removed express-session to avoid memory leaks in serverless environments
 */
const sessionMiddleware = (req, res, next) => {
    // Simple pass-through middleware with no session functionality
    next();
};

module.exports = sessionMiddleware;
