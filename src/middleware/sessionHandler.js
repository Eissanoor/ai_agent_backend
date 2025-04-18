const session = require('express-session');

// For Vercel serverless functions, we need a session store that doesn't use memory
// This conditional setup allows local development to use memory store
// while production uses a more appropriate store
let sessionMiddleware;

if (process.env.NODE_ENV === 'production') {
    // In production, don't use sessions at all for serverless functions
    // Instead, use stateless authentication (like JWT)
    sessionMiddleware = (req, res, next) => {
        // This is a pass-through middleware that doesn't actually create sessions
        // You should implement proper JWT or other stateless auth instead
        next();
    };
} else {
    // In development, use the memory store (with warning)
    console.warn('Using in-memory session store - not suitable for production');
    sessionMiddleware = session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    });
}

module.exports = sessionMiddleware;
