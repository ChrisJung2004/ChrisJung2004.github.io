// Small helpers that show the user what is happening: a spinner while waiting
// on Firebase, a green message when something worked, and a red message with
// the error when something failed. Every message goes into a DOM element
// (never window.alert) that screen readers announce.

// Removes everything inside a status element and resets its look.
// statusElement: the element that shows messages.
export function clearStatus(statusElement) {
    statusElement.textContent = '';
    statusElement.className = 'status';
}

// Shows a spinning icon and a "working" message.
// statusElement: element, text: string such as 'Logging in…'.
export function showWorking(statusElement, text) {
    const spinner = document.createElement('span');

    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    clearStatus(statusElement);
    statusElement.classList.add('status-working');
    statusElement.appendChild(spinner);
    statusElement.appendChild(document.createTextNode(text));
}

// Shows a success message.
// statusElement: element, text: string.
export function showSuccess(statusElement, text) {
    clearStatus(statusElement);
    statusElement.classList.add('status-success');
    statusElement.textContent = text;
}

// Shows an error message.
// statusElement: element, text: string.
export function showError(statusElement, text) {
    clearStatus(statusElement);
    statusElement.classList.add('status-error');
    statusElement.textContent = text;
}

// Turns a form's buttons and fields off while a request is running so the user
// can't send it twice, and back on when it finishes.
// form: the <form> element, isBusy: boolean.
export function setFormBusy(form, isBusy) {
    form.setAttribute('aria-busy', String(isBusy));
    for (const field of form.elements) {
        field.disabled = isBusy;
    }
}

// Plain-language versions of the Firebase errors users are most likely to hit.
const FRIENDLY_ERRORS = {
    'auth/too-many-requests': 'Too many tries. Wait a few minutes and try again.',
    'auth/network-request-failed': 'Could not reach the server. Check your internet connection.',
    'auth/popup-closed-by-user': 'The Google window was closed before you finished signing in.',
    'auth/cancelled-popup-request': 'The Google window was closed before you finished signing in.',
    'auth/popup-blocked': 'Your browser blocked the Google window. Allow popups for this site and try again.',
    'auth/unauthorized-domain': 'This website is not on the Firebase list of approved domains yet.',
    'auth/account-exists-with-different-credential': 'That email is already linked to a different sign-in method.',
    'auth/operation-not-allowed': 'Google sign-in is turned off for this site right now.',
    'unavailable': 'Could not reach the database. Check your internet connection and try again.',
    'no-data': 'The route data has not been uploaded to the database yet.',
    'permission-denied': 'You don\'t have permission to do that. Try logging out and back in.'
};

// Builds the message to show for a Firebase error: a plain-language sentence
// plus Firebase's own error code so the exact problem is still visible.
// error: the error object from a Firebase .catch(). Returns a string.
export function describeFirebaseError(error) {
    const code = error.code || 'unknown-error';
    const friendlyText = FRIENDLY_ERRORS[code] || error.message || 'Something went wrong. Please try again.';
    return friendlyText + ' (Firebase: ' + code + ')';
}
