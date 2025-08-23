// middleware/uploadLimit.js
import rateLimit from "express-rate-limit";

// ✅ Upload route-specific limiter (more strict)
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 uploads per 10 mins per IP
  message: {
    status: 429,
    error: 'Too many uploads. Please wait before trying again.',
  },
  standardHeaders: true, // ✅ Return rate limit info in headers
  legacyHeaders: false,  // ❌ Don't use legacy `X-RateLimit-*` headers
});

export default uploadLimiter;
