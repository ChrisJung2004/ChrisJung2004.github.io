'use strict';

// Ids of the contact form and the message shown after it is submitted.
const CONTACT_FORM_ID = 'contact-form';
const CONTACT_STATUS_ID = 'contact-status';
const CONTACT_EMAIL = 'chrisjung3362@gmail.com';

// Builds the thank-you text shown after the form is submitted.
// name: string typed by the user. Returns a string.
function createThankYouText(name) {
    return 'Thanks, ' + name + '! Sending messages from this form will be added along with accounts ' +
        'in the next version of the site. Until then, please email ' + CONTACT_EMAIL + '.';
}

// Stops the page from reloading on submit and shows the thank-you message instead.
// The browser checks the required fields and email format before this runs.
// event: the form's submit event.
function handleContactSubmit(event) {
    const contactForm = event.target;
    const statusMessage = document.getElementById(CONTACT_STATUS_ID);
    const name = contactForm.elements.name.value.trim();

    event.preventDefault();
    statusMessage.textContent = createThankYouText(name);
    contactForm.reset();
}

document.getElementById(CONTACT_FORM_ID).addEventListener('submit', handleContactSubmit);
