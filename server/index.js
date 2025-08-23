import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import uploadFile from "./api/uploadFile.js";
import downloadFile from "./api/downloadFile.js";
import rateLimit from 'express-rate-limit'; // ✅ Step 1: Import rate limiter

const app = express();
app.use(express.json());


dotenv.config({
    path:'./.env'
})

// const allowedOrigins = ['https://drop-lite.vercel.app'];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,  // only if your frontend sends cookies or auth headers
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // Handle preflight requests (OPTIONS)
// app.options('*', cors());



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

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});

