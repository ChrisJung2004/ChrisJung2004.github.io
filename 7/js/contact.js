// The Contact Us form. When the user sends a message it is saved in the
// Firebase Cloud Firestore "contactMessages" collection, and the user is told
// whether it was saved or what went wrong.
import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import { requireUser } from './auth.js';
import { showWorking, showSuccess, showError, setFormBusy, describeFirebaseError } from './feedback.js';

// Ids of the contact form and the message shown after it is submitted.
const CONTACT_FORM_ID = 'contact-form';
const CONTACT_STATUS_ID = 'contact-status';
const MESSAGES_PATH = 'contactMessages';

// Collects what the user typed into an object ready to save.
// form: the contact <form>, user: the logged-in Firebase user. Returns an object.
function readContactForm(form, user) {
    const tripSelect = form.elements.trip;

    return {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        trip: tripSelect.value,
        tripName: tripSelect.options[tripSelect.selectedIndex].text,
        message: form.elements.message.value.trim(),
        uid: user.uid,
        accountEmail: user.email,
        sentAt: serverTimestamp()
    };
}

// Saves the message to Firebase, with a spinner while it sends and a
// confirmation (or the error) when it finishes.
// event: the form's submit event, user: the logged-in Firebase user.
function handleContactSubmit(event, user) {
    const form = event.target;
    const status = document.getElementById(CONTACT_STATUS_ID);
    const contactMessage = readContactForm(form, user);

    event.preventDefault();
    showWorking(status, 'Sending your message…');
    setFormBusy(form, true);

    addDoc(collection(db, MESSAGES_PATH), contactMessage)
        .then((savedDoc) => {
            form.reset();
            form.elements.email.value = user.email;
            showSuccess(status, 'Thanks, ' + contactMessage.name + '! Your message was received and saved ' +
                '(reference ' + savedDoc.id + '). I will reply to ' + contactMessage.email + ' within two days.');
        })
        .catch((error) => {
            showError(status, 'Your message was not sent. ' + describeFirebaseError(error));
        })
        .finally(() => setFormBusy(form, false));
}

// Waits for the login check, fills in the user's email, then connects the form.
requireUser().then((user) => {
    const form = document.getElementById(CONTACT_FORM_ID);

    form.elements.email.value = user.email;
    form.addEventListener('submit', (event) => handleContactSubmit(event, user));
});
