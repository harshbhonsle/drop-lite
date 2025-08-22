import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import uploadFile from "./api/uploadFile.js";
import downloadFile from "./api/downloadFile.js";
import rateLimit from 'express-rate-limit'; // ✅ Step 1: Import rate limiter

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Global rate limiter (optional, or apply per route below)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests. Please try again later.',
  },
});

app.use(globalLimiter); // ✅ Apply global limiter

// ✅ Upload route-specific limiter (more strict)
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 uploads per 10 mins per IP
  message: {
    status: 429,
    error: 'Too many uploads. Please wait before trying again.',
  },
});
app.use('/upload-file', uploadLimiter); // ✅ Apply to upload endpoint

// ✅ Verification limiter (protect brute force on 4-digit codes)
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // max 20 attempts
  message: {
    status: 429,
    error: 'Too many verification attempts. Please wait.',
  },
});
app.use('/download-file/:id/verify', verifyLimiter); // ✅ Apply to verify route

// Routes
app.get('/', (req, res) => {
  res.send("Drop Lite is running");
});

app.use("/upload-file", uploadFile);
console.log("upload file is running", uploadFile);

app.use("/download-file", downloadFile);

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});






// import express from "express";
// import cors from 'cors'
// import dotenv from 'dotenv'
// import uploadFile from "./api/uploadFile.js"
// import downloadFile from "./api/downloadFile.js"
// import rateLimit from 'express-rate-limit';
// dotenv.config();

// const app = express();
// app.use(express.json());

// app.use(cors())



// app.get('/', (req,res) => {
//     res.send("Drop Lite is running");
// })

// app.use("/upload-file",uploadFile)
// console.log("upload file is running ", uploadFile)
// app.use("/download-file", downloadFile)
// const PORT = 5000;

// app.listen(PORT, () => {
//     console.log(`App is running on ${PORT}`);
// })

