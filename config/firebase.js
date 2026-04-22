import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// New imports for Auth
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBL38I3MTa33yLJGXm3cy0msH39yUkwiFk",
  authDomain: "database-336c3.firebaseapp.com",
  databaseURL: "https://database-336c3-default-rtdb.firebaseio.com",
  projectId: "database-336c3",
  storageBucket: "database-336c3.firebasestorage.app",
  messagingSenderId: "15509018689",
  appId: "1:15509018689:web:12e9b91623739ff4208ec0",
  measurementId: "G-0YVLC19P1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth with Persistence
// This prevents the user from being logged out every time the app restarts
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});