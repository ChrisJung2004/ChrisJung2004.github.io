// Connects the site to Firebase. Every other script imports auth and db from here.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

// Paste the firebaseConfig object from your Firebase console here
// (Project settings > General > Your apps > Web app > SDK setup and configuration > Config).
// These values are not secret. The database rules are what keep the data safe.
const firebaseConfig = {
  apiKey: "AIzaSyANFD_7T0y_R7vPspNrD0Fnaffa2vsXmvk",
  authDomain: "dayroute-42d79.firebaseapp.com",
  projectId: "dayroute-42d79",
  storageBucket: "dayroute-42d79.firebasestorage.app",
  messagingSenderId: "786963340638",
  appId: "1:786963340638:web:3a73887dc8311da1ad43cf",
  measurementId: "G-TDYCR4HYHJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
