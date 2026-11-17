import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBiEC2qL4E_IaEF4cQM1arT2rd8QPX-7lc",
  authDomain: "canteen-web-3d951.firebaseapp.com",
  projectId: "canteen-web-3d951",
  storageBucket: "canteen-web-3d951.firebasestorage.app",
  messagingSenderId: "165945405257",
  appId: "1:165945405257:web:53fd3e097341e1ad2b3498"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);