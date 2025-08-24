import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import uploadFile from "./api/uploadFile.js";
import downloadFile from "./api/downloadFile.js";
import rateLimit from 'express-rate-limit'; // ✅ Step 1: Import rate limiter

const app = express();
app.use(express.json());

// ✅ Safe setting for Render or any single-proxy setup
app.set('trust proxy', 'loopback');


dotenv.config({
    path:'./.env'
})

const allowedOrigins = ['https://drop-lite.vercel.app' ,"http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));



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

// Routes
app.get('/', (_, res) => {
  res.send("Drop Lite is running");
});

app.use("/upload-file", uploadFile);


app.use("/download-file", downloadFile);

// ✅ Catch-all route for undefined paths
app.use((req, res) => {
  res.status(404).json({ message: `The URL ${req.originalUrl} doesn't exist` });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});

