import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "kindcycle-6xk0g",
  appId: "1:973651843517:web:9d4ea86e6fa2d875005ad4",
  storageBucket: "kindcycle-6xk0g.firebasestorage.app",
  apiKey: "AIzaSyAJTPOrTAZXNaRQzzpR5PgqV07eD1pz_PY",
  authDomain: "kindcycle-6xk0g.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "973651843517",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
