<div align="center">

# 🎓 Course Management System (LMS)

A modern, full-stack Learning Management System built with **React**, **Vite**, **Node.js**, **Express**, and **Firebase**. Designed for seamless course discovery, enrollment, student progress tracking, quizzes, assignments, and role-based administration.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-coursemanagment.vercel.app-blue?style=for-the-badge&logo=vercel)](https://coursemanagment.vercel.app/)

<br/><br/>

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646C9F?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)](https://github.com/Yimencodehub/Coursemanagment)

<br/>

🔗 **Live Website URL**: **[https://coursemanagment.vercel.app/](https://coursemanagment.vercel.app/)**

<br/>

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYimencodehub%2FCoursemanagment&root-directory=client)

</div>

---

## 📌 Table of Contents

- [🌐 Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Demo Credentials](#-demo-credentials)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Environment Variables](#-environment-variables)
- [Firebase Configuration](#-firebase-configuration)
- [Vercel Deployment Guide](#-vercel-deployment-guide)
- [API Reference](#-api-reference)
- [Author & License](#-author--license)

---

## 🌐 Live Demo

The application is deployed live on Vercel:

👉 **[https://coursemanagment.vercel.app/](https://coursemanagment.vercel.app/)**

Feel free to visit, register an account, or test with the [demo credentials](#-demo-credentials).

---

## ✨ Features

- 🔐 **Role-Based Authentication**: Secure login & registration supporting **Admin**, **Instructor**, and **Student** roles.
- 📚 **Course Management**: Create, update, publish, assign instructors, and delete courses.
- 🎯 **Student Learning Portal**: Browse courses by category, enroll with a single click, and access "My Learning".
- 📝 **Quizzes & Assessments**: Interactive quizzes with instant scoring and attempt histories.
- 📁 **Assignment Submissions**: Instructors post assignments; students submit work and track feedback.
- 📊 **Admin Dashboard**: Centralized management for users, courses, analytics, and platform content.
- 📬 **Newsletter & Subscription**: Integrated newsletter sign-up with real-time updates.
- ⚡ **Offline & Cloud Sync**: Dual-layer architecture connecting directly to Firebase Firestore with smart LocalStorage fallbacks.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM 6, Context API, CSS3 |
| **Backend** | Node.js, Express.js, CORS |
| **Database & Auth** | Google Cloud Firebase (Firestore & Firebase Auth) + Local JSON store |
| **Deployment** | Vercel (Frontend Client) & Render / Railway (Backend API) |

---

## 📂 Project Structure

```bash
Coursemanagment/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, CourseCard...)
│   │   ├── context/            # AuthContext & global state
│   │   ├── pages/              # App pages (Home, Courses, Dashboard, Login, Admin...)
│   │   ├── services/           # API handlers and Firebase integration
│   │   ├── config/             # Dynamic API configuration
│   │   └── firebase.js         # Firebase client SDK initialization
│   ├── vercel.json             # Vercel SPA routing rewrites configuration
│   ├── .env.example            # Client environment variables template
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── config/                 # DB connectors (Firestore & JSON store)
│   ├── routes/                 # REST API endpoints (courses, auth, quizzes, etc.)
│   ├── data/                   # Persistent local fallback storage (store.json)
│   ├── app.js                  # Express application entry point
│   └── package.json
└── README.md
```

---

## 🔑 Demo Credentials

To test out all role capabilities without registering a new account, use the following pre-configured demo users:

| Role | Email | Password |
|---|---|---|
| 👑 **Admin** | `admin@example.com` | `admin123` |
| 👨‍🏫 **Instructor** | `instructor@example.com` | `instructor123` |
| 🎓 **Student** | `student@example.com` | `student123` |

---

## 🚀 Quick Start & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Yimencodehub/Coursemanagment.git
cd Coursemanagment
```

### 2. Setup and run the Client (Frontend)
```bash
cd client
npm install
npm run dev
```
The React frontend will be live at `http://localhost:5173`.

### 3. Setup and run the Server (Backend)
Open a new terminal window:
```bash
cd server
npm install
node app.js
```
The Express backend will run at `http://localhost:5000`.

---

## ⚙️ Environment Variables

### Client (`client/.env`)
Create a `.env` file inside the `client/` folder:
```env
# Backend API Base URL (defaults to http://localhost:5000 in development)
VITE_API_URL=http://localhost:5000
```

---

## 🔥 Firebase Configuration

The project is pre-configured with Firebase, but to connect your own Firebase instance:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Enable **Cloud Firestore** in test or production mode.
4. Update client credentials in `client/src/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
5. *(Optional for Server)*: Generate a service account private key from Firebase Project Settings ➔ Service Accounts, and save it as `server/serviceAccountKey.json`.

---

## 🌐 Vercel Deployment Guide

Deploying this project to **Vercel** takes less than 2 minutes:

### Step 1: Import to Vercel
1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.
3. Locate **`Coursemanagment`** and click **"Import"**.

### Step 2: Configure Project Settings
In the configuration screen, adjust the following:
- **Root Directory**: Click **Edit** and select **`client`** *(Very important)*.
- **Framework Preset**: `Vite` (auto-detected).
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables** *(Optional)*:
  - Key: `VITE_API_URL`
  - Value: Your deployed backend URL (or leave empty if using Firebase direct/client mode).

### Step 3: Deploy
Click **"Deploy"**. Your site will be live at `https://your-project.vercel.app`! 🎉

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses` | Fetch all approved courses |
| `GET` | `/api/courses/:id` | Fetch course details by ID |
| `POST` | `/api/courses` | Create a new course |
| `PUT` | `/api/courses/:id` | Update an existing course |
| `DELETE` | `/api/courses/:id` | Remove a course |
| `PATCH` | `/api/courses/:id/assign-instructor` | Assign an instructor to a course |
| `POST` | `/api/auth/forgot-password` | Send password reset token |
| `POST` | `/api/auth/reset-password` | Reset user password using token |
| `POST` | `/api/subscribers` | Subscribe to newsletter updates |
| `GET` | `/api/health` | Service health and database status |

---

## 👤 Author & Contribution

- **GitHub Repository**: [@Yimencodehub/Coursemanagment](https://github.com/Yimencodehub/Coursemanagment)
- Pull requests, issues, and feature requests are welcome!

---

<div align="center">
⭐ Star this repository if you found it helpful!
</div>
