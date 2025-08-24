# 📦 DropLite

DropLite is a lightweight, privacy-first file sharing app that lets users upload images and videos, generate secure access codes, and share download links that expire automatically. Built with Express, Cloudinary, and React.

🔗 **Live Site**: [https://drop-lite.vercel.app](https://drop-lite.vercel.app)

---

## 🚀 Features

- 🔒 Secure uploads via Cloudinary
- 🧠 Unique access codes for each file
- ⏳ Auto-expiry after 7 days
- 📁 Supports multiple images and one video per upload
- ⚡ Rate-limited backend to prevent abuse
- 🌐 CORS-protected API
- 🖼️ Drag & drop UI for easy uploads

---

## 🛠 Tech Stack

### 🛠 Essential Tech Stack

| Layer        | Technology                           |
|--------------|--------------------------------------|
| Frontend     | React + Vite                         |
| Styling      | Tailwind CSS                         |
| Routing      | React Router DOM                     |
| Backend      | Express.js                           |
| File Upload  | Multer                               |
| Storage      | Cloudinary                           |
| Database     | SQLite (via `db.js`)                 |
| Security     | express-rate-limit, CORS             |
| Dev Tools    | Nodemon, dotenv                      |
| Hosting      | Vercel (frontend), Render (backend)  |


---

## 📦 API Endpoints

### `POST /upload-file/upload`
Uploads files and returns download links + access code.

### `GET /download-file/:id`
Fetches metadata for a file by ID.

### `POST /download-file/:id/verify`
Verifies access code and returns file URL.

---

## 🔐 Environment Variables

Create a `.env` file in the backend with:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BASE_URL=https://drop-lite.onrender.com
```
## 🌐Client Environment Variables (.env)
To configure your frontend to communicate with the backend, create a .env file in the root of your Vite project (same level as vite.config.js) and add: 
```
VITE_BASE_URL=https://drop-lite.onrender.com
⚠️ All environment variables exposed to the browser in Vite must start with VITE_.
```
 ## 🔧Usage in Code
Access the variable in your frontend code like this:
```
js
const baseUrl = import.meta.env.VITE_BASE_URL;
```
Use it to make API requests:
```
js
fetch(`${baseUrl}/upload-file/upload`, {
  method: 'POST',
  body: formData,
});
```
## 🚀Deployment Notes
If you're deploying to Vercel, add the same variable in your project settings:

Go to Project Settings → Environment Variables

Add:

Name: VITE_BASE_URL

Value: https://drop-lite.onrender.com

Redeploy your frontend to apply the changes
---
## 🧪Local Development
🔧 Backend Setup
```cd server
npm install
npm run dev
```
## 🎨Frontend Setup
```
cd client
npm install
npm run dev
```
---
## 🧭Routing Notes

To support client-side routing on Vercel (e.g. /f/:id), include a vercel.json file in the frontend root:
```
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
---
## 🙌Acknowledgments

Special thanks to Aviv for helping host the first live version of DropLite!

## 📄License
MIT License. Feel free to fork, remix, and improve

---

Let me know if you want to add badges, screenshots, or a contributors section. I can help you make it pop for GitHub visitors.
