// One-time admin tool: reads routes.json from the computer and saves each trip
// type as a document in the Firestore "tripTypes" collection. The database
// rules only let the site owner's account write there.
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { doc, writeBatch } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import { showWorking, showSuccess, showError, setFormBusy, describeFirebaseError } from './feedback.js';

const form = document.getElementById('seed-form');
const status = document.getElementById('seed-status');
const userText = document.getElementById('seed-user');

// Saves every trip type in one batch, with an "order" field so the site can
// show them in the same order as the file.
// tripTypes: array of trip type objects. Returns a Promise.
function uploadTripTypes(tripTypes) {
    const batch = writeBatch(db);
    tripTypes.forEach((tripType, index) => {
        batch.set(doc(db, 'tripTypes', tripType.id), { ...tripType, order: index });
    });
    return batch.commit();
}

function handleUpload(event) {
    const file = form.elements.file.files[0];

    event.preventDefault();
    if (!auth.currentUser) {
        showError(status, 'Log in with Google first.');
        return;
    }

    showWorking(status, 'Uploading…');
    setFormBusy(form, true);
    file.text()
        .then((text) => {
            const data = JSON.parse(text);
            if (!Array.isArray(data.tripTypes)) {
                throw new Error('That file has no "tripTypes" list. Choose routes.json.');
            }
            return uploadTripTypes(data.tripTypes).then(() => data.tripTypes.length);
        })
        .then((count) => showSuccess(status, 'Done. ' + count + ' trip types are saved in Firestore.'))
        .catch((error) => showError(status, error.code ? describeFirebaseError(error) : error.message))
        .finally(() => setFormBusy(form, false));
}

document.getElementById('seed-login').addEventListener('click', () => {
    signInWithPopup(auth, new GoogleAuthProvider())
        .catch((error) => showError(status, describeFirebaseError(error)));
});
onAuthStateChanged(auth, (user) => {
    userText.textContent = user ? 'Logged in as ' + user.email + '.' : 'Not logged in.';
});
form.addEventListener('submit', handleUpload);
