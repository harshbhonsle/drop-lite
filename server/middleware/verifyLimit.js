import rateLimit from "express-rate-limit";

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per window per IP
  standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      status: 429,
      error: 'Too many verification attempts. Please wait before retrying.',
    });
  },
});

export default verifyLimiter;
