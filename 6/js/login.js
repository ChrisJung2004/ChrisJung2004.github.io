'use strict';

// Ids and class names used by the "Log in / Sign up" popup on every page.
const LOGIN_POPUP_ID = 'login-popup';
const LOGIN_CLOSE_BUTTON_ID = 'close-login-popup';
const LOGIN_OPEN_BUTTON_CLASS = 'open-login';

// Shows the popup and moves keyboard focus onto its close button.
// popup: the popup element.
function openLoginPopup(popup) {
    popup.hidden = false;
    document.getElementById(LOGIN_CLOSE_BUTTON_ID).focus();
}

// Hides the popup and returns focus to the button that opened it.
// popup: the popup element, openerButton: the button that was clicked (or null).
function closeLoginPopup(popup, openerButton) {
    popup.hidden = true;
    if (openerButton) {
        openerButton.focus();
    }
}

// Connects every "Log in" button to the popup, and lets the user close it with
// the close button, the Escape key, or by clicking the dark area around it.
function setUpLoginPopup() {
    const popup = document.getElementById(LOGIN_POPUP_ID);
    const closeButton = document.getElementById(LOGIN_CLOSE_BUTTON_ID);
    const openButtons = document.querySelectorAll('.' + LOGIN_OPEN_BUTTON_CLASS);
    let lastOpenButton = null;

    openButtons.forEach((openButton) => {
        openButton.addEventListener('click', () => {
            lastOpenButton = openButton;
            openLoginPopup(popup);
        });
    });

    closeButton.addEventListener('click', () => closeLoginPopup(popup, lastOpenButton));

    // Clicking the dark backdrop (not the white box) closes the popup.
    popup.addEventListener('click', (event) => {
        if (event.target === popup) {
            closeLoginPopup(popup, lastOpenButton);
        }
    });

    // Escape closes the popup. Tab stays on the close button, since it is the
    // only thing inside the popup that can be focused.
    popup.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeLoginPopup(popup, lastOpenButton);
        } else if (event.key === 'Tab') {
            event.preventDefault();
            closeButton.focus();
        }
    });
}

setUpLoginPopup();
