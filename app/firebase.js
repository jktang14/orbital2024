import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0KFSLHWL_2Oiv2PW_J-2Rp1GVf-FwtgA",
  authDomain: "reversiplus-52db7.firebaseapp.com",
  projectId: "reversiplus-52db7",
  storageBucket: "reversiplus-52db7.appspot.com",
  messagingSenderId: "991203010187",
  appId: "1:991203010187:web:48ecc8e83659a4a56c968e",
  measurementId: "G-RGPL2PZ9QM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db};