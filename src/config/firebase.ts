import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAijz5ermakPNx5hmIs20JU_k15utObSxs",
  authDomain: "todoapp-a588f.firebaseapp.com",
  projectId: "todoapp-a588f",
  storageBucket: "todoapp-a588f.firebasestorage.app",
  messagingSenderId: "339751370137",
  appId: "1:339751370137:web:4063ae0e40920466916708"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };