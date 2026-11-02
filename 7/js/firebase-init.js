// Connects the site to Firebase. Every other script imports auth and db from here.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

// Paste the firebaseConfig object from your Firebase console here
// (Project settings > General > Your apps > Web app > SDK setup and configuration > Config).
// These values are not secret. The database rules are what keep the data safe.
const firebaseConfig = {
    apiKey: 'PASTE_YOUR_API_KEY',
    authDomain: 'PASTE_YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'PASTE_YOUR_PROJECT_ID',
    storageBucket: 'PASTE_YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'PASTE_YOUR_SENDER_ID',
    appId: 'PASTE_YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
