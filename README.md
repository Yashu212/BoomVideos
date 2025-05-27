# Boom Video Platform – Frontend

This is the frontend for the Boom video streaming platform, built using **React** and **Tailwind CSS**. It provides a modern, responsive UI for video browsing, uploading, purchasing, gifting, and commenting.

---

## 🚀 Features

- Unified feed for short & long videos
- Light/Dark mode toggle
- Register, Login, and Profile
- Auto-play short videos (Reels-like)
- Conditional access for paid content
- Gift and comment on videos
- Watch/purchase gated content
- Responsive UI (Mobile + Web)

---

## 🛠️ Tech Stack

- **React 18**
- **Tailwind CSS**
- **Axios**
- **Lucide Icons**
- **Moment.js**

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Yashu212/BoomVideos.git
cd BoomVideos
```
### 2. Install dependencies
```bash
npm install
```

### 3. Run the dev server
```bash
npm run dev
```
- The app runs on: http://localhost:3000

##📁 Folder Structure
```
src/
├── components/
│   ├── Auth/          # Login, Register
│   ├── Feed/          # Video feed
│   ├── Profile.jsx    # User profile
│   └── Utils/         # GiftModal, CommentModal, Toasts, etc.
├── App.jsx
├── main.jsx
└── index.css
```

## 🌐 Backend Integration

This frontend connects to a backend hosted at:
``` url
-> https://boom-app-backend-production.up.railway.app/
-> https://determined-peace-production.up.railway.app/
```

## 👨‍💻 Author

Built by **Yash Shukla** 
