import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-KwF_6O4WyQHbuux1ZZarBVGHoKeEvh4",
  authDomain: "course-management-system-ae4fa.firebaseapp.com",
  projectId: "course-management-system-ae4fa",
  storageBucket: "course-management-system-ae4fa.firebasestorage.app",
  messagingSenderId: "75197576781",
  appId: "1:75197576781:web:d8936a7bd134019d5a8e04",
  measurementId: "G-LP8WFF2VDG"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
