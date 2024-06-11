import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0KFSLHWL_2Oiv2PW_J-2Rp1GVf-FwtgA",
  authDomain: "reversiplus-52db7.firebaseapp.com",
  databaseURL: "https://reversiplus-52db7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "reversiplus-52db7",
  storageBucket: "reversiplus-52db7.appspot.com",
  messagingSenderId: "991203010187",
  appId: "1:991203010187:web:48ecc8e83659a4a56c968e",
  measurementId: "G-RGPL2PZ9QM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Initialize Realtime Database and get a reference to the service
const realtimeDatabase = getDatabase(app);

export {auth, db, realtimeDatabase};