// User accounts for every page: log in (which also signs up new users) and log
// out with Google through Firebase Authentication. It also protects the pages
// after Home: if nobody is logged in, those pages send the user back to Home
// with the log in window open.
import { auth } from './firebase-init.js';
import {
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { clearStatus, showWorking, showSuccess, showError, describeFirebaseError } from './feedback.js';

// Pages a user may be sent back to after logging in. Anything else is ignored
// so a link can't send people off to another site.
const PROTECTED_PAGES = ['routes.html', 'info.html', 'contact.html'];
const HOME_PAGE = 'index.html';

// Titles shown at the top of the account window for each panel.
const PANEL_TITLES = {
    login: 'Log in',
    account: 'Your account'
};

const dialog = document.getElementById('account-dialog');
const dialogTitle = document.getElementById('account-dialog-title');
const dialogNotice = document.getElementById('account-notice');
const googleButton = document.getElementById('google-signin');
const googleStatus = document.getElementById('google-status');
const pageNeedsLogin = document.body.hasAttribute('data-requires-login');

let isLeavingPage = false;
let userClickedLogout = false;
let resolveFirstCheck;
const firstCheck = new Promise((resolve) => {
    resolveFirstCheck = resolve;
});


/* ---------- Where to go after logging in ---------- */

// Moves to another page only once, even if two pieces of code ask at the same time
// (the login button and the login listener both react to a new login).
// url: string, replaceHistory: boolean (true so Back doesn't return to a redirect).
function goToPage(url, replaceHistory) {
    if (isLeavingPage) {
        return;
    }
    isLeavingPage = true;
    if (replaceHistory) {
        window.location.replace(url);
    } else {
        window.location.assign(url);
    }
}

// Reads ?next=routes.html#ski from the address bar.
// Returns the page to go to after logging in, or '' if there isn't a safe one.
function getNextPage() {
    const next = new URLSearchParams(window.location.search).get('next') || '';
    const pageName = next.split('#')[0];
    return PROTECTED_PAGES.includes(pageName) ? next : '';
}

// Sends a logged-out user from a protected page back to Home, remembering
// which page (and trip type, like #ski) they wanted.
function sendToHome() {
    const pageName = window.location.pathname.split('/').pop() || HOME_PAGE;
    const wanted = pageName + window.location.hash;
    goToPage(HOME_PAGE + '?next=' + encodeURIComponent(wanted), true);
}


/* ---------- The account window ---------- */

// Shows one panel (login or account) and hides the other.
// panelName: one of the keys in PANEL_TITLES.
function showPanel(panelName) {
    dialog.querySelectorAll('[data-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.panel !== panelName;
    });
    dialogTitle.textContent = PANEL_TITLES[panelName];
    clearStatus(googleStatus);
}

// Opens the account window on the right panel for whether the user is logged in.
// noticeText: optional message at the top, such as why the window opened.
function openAccountDialog(noticeText) {
    dialogNotice.textContent = noticeText || '';
    dialogNotice.hidden = !noticeText;
    showPanel(auth.currentUser ? 'account' : 'login');
    dialog.showModal();
}

// Shows a message in the "Your account" box on Home, if this page has one.
// text: string.
function showPageMessage(text) {
    const pageStatus = document.getElementById('home-account-status');
    if (pageStatus) {
        showSuccess(pageStatus, text);
    }
}

// Sends the user on after logging in: to the page they wanted if there is one,
// otherwise closes the window and shows a message on the page.
// email: the email of the account that just logged in.
function finishLogin(email) {
    const nextPage = getNextPage();

    if (nextPage) {
        goToPage(nextPage, false);
        return;
    }
    dialog.close();
    showPageMessage('You are logged in as ' + email + '.');
}


/* ---------- Logging in and out ---------- */

// Logs in with a Google account in a popup window. The first time someone
// does this, Firebase creates their account, so this is also the sign up.
function handleGoogleSignIn() {
    showWorking(googleStatus, 'Waiting for Google…');
    googleButton.disabled = true;

    signInWithPopup(auth, new GoogleAuthProvider())
        .then((result) => {
            clearStatus(googleStatus);
            finishLogin(result.user.email);
        })
        .catch((error) => showError(googleStatus, describeFirebaseError(error)))
        .finally(() => {
            googleButton.disabled = false;
        });
}

// Logs out. On protected pages the auth listener below then sends the user Home.
function handleLogout() {
    const pageStatus = document.getElementById('home-account-status');

    userClickedLogout = true;
    if (pageStatus) {
        showWorking(pageStatus, 'Logging out…');
    }
    signOut(auth)
        .then(() => {
            if (dialog.open) {
                dialog.close();
            }
            showPageMessage('You have been logged out.');
        })
        .catch((error) => {
            if (pageStatus) {
                showError(pageStatus, describeFirebaseError(error));
            }
        });
}


/* ---------- Keeping the page in sync with the login state ---------- */

// Updates every account button, label and the Home account box for the user.
// user: the Firebase user, or null when logged out.
function updateAccountUi(user) {
    const signedIn = Boolean(user);

    document.querySelectorAll('.nav-button.open-account').forEach((button) => {
        button.textContent = signedIn ? 'Account' : 'Log in / Sign up';
    });
    document.querySelectorAll('.signed-in-only').forEach((element) => {
        element.hidden = !signedIn;
    });
    document.querySelectorAll('.signed-out-only').forEach((element) => {
        element.hidden = signedIn;
    });
    document.querySelectorAll('.user-email').forEach((element) => {
        element.textContent = signedIn ? user.email : '';
    });
}

// Shows the real page content on a protected page once a user is confirmed.
function revealProtectedContent() {
    document.getElementById('auth-gate').hidden = true;
    document.getElementById('page-content').hidden = false;
}

// Runs once when the page loads and again every time the user logs in or out.
onAuthStateChanged(auth, (user) => {
    updateAccountUi(user);
    resolveFirstCheck(user);

    if (pageNeedsLogin) {
        if (user) {
            revealProtectedContent();
        } else if (userClickedLogout) {
            goToPage(HOME_PAGE + '?loggedout=1', true);
        } else {
            sendToHome();
        }
        return;
    }

    // Home page: confirm a log out that started on another page.
    if (!user && new URLSearchParams(window.location.search).has('loggedout')) {
        showPageMessage('You have been logged out.');
    }

    // Home page: a logged-in user who followed a "next" link goes straight there.
    // A logged-out user sees why they were sent here.
    if (getNextPage()) {
        if (user) {
            goToPage(getNextPage(), true);
        } else if (!dialog.open) {
            openAccountDialog('Please log in to see that page.');
        }
    }
});

// Resolves with the logged-in user on a protected page. Page scripts wait for
// this before they load data from Firebase. If nobody is logged in, the page is
// already being sent Home, so the promise never resolves.
export function requireUser() {
    return firstCheck.then((user) => {
        if (!user) {
            return new Promise(() => {});
        }
        return user;
    });
}


/* ---------- Connecting buttons ---------- */

function setUpAccountControls() {
    document.querySelectorAll('.open-account').forEach((button) => {
        button.addEventListener('click', () => openAccountDialog(''));
    });
    document.querySelectorAll('.logout-button').forEach((button) => {
        button.addEventListener('click', handleLogout);
    });
    googleButton.addEventListener('click', handleGoogleSignIn);

    document.getElementById('close-account-dialog').addEventListener('click', () => dialog.close());
    // Clicking the dark area around the window closes it.
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
}

setUpAccountControls();
