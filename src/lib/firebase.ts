import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAJTPOrTAZXNaRQzzpR5PgqV07eD1pz_PY",
  authDomain: "kindcycle-6xk0g.firebaseapp.com",
  projectId: "kindcycle-6xk0g",
  storageBucket: "kindcycle-6xk0g.appspot.com",
  messagingSenderId: "973651843517",
  appId: "1:973651843517:web:9d4ea86e6fa2d875005ad4"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
