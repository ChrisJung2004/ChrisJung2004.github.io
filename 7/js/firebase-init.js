import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';


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
