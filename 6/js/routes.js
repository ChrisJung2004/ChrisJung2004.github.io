'use strict';

// Location of the route data, plus the ids of the page elements this script fills in.
const DATA_URL = 'data/routes.json';
const ELEMENT_IDS = {
    app: 'route-app',
    steps: 'progress-steps',
    heading: 'page-heading',
    tagline: 'page-tagline'
};
const SITE_NAME = 'The 30-Day Route';
const IMAGE_SIZE = {
    width: 640,
    height: 360
};


/* ---------- Small helpers for building elements ---------- */

// Creates an element with an optional class name and optional text.
// tagName: string, className: string ('' for none), text: string (optional).
// Returns the new element.
function createElementWithText(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

// Creates an <img>. If the image file is missing, it swaps in backupSrc once
// so the page never shows a broken image icon.
// src, alt, backupSrc: strings. Returns the <img> element.
function createImage(src, alt, backupSrc) {
    const image = document.createElement('img');
    let usedBackup = false;

    image.addEventListener('error', () => {
        if (!usedBackup && backupSrc) {
            usedBackup = true;
            image.src = backupSrc;
        }
    });

    image.src = src;
    image.alt = alt;
    image.width = IMAGE_SIZE.width;
    image.height = IMAGE_SIZE.height;
    return image;
}

// Creates a styled button that runs onClick when pressed.
// label: string, className: string, onClick: function. Returns the <button>.
function createButton(label, className, onClick) {
    const button = createElementWithText('button', className, label);
    button.type = 'button';
    button.addEventListener('click', onClick);
    return button;
}

// Creates a clickable card for a trip type or region.
// cardInfo: { title, subtitle, areas, season, image, backupImage } (subtitle, areas
// and season are optional). onSelect: function run when the card is clicked.
// Returns an <li> holding the card button.
function createCard(cardInfo, onSelect) {
    const listItem = document.createElement('li');
    const button = createButton('', 'card', onSelect);
    const cardBody = createElementWithText('span', 'card-body');

    // The image is decorative because the card title already says what it is.
    button.appendChild(createImage(cardInfo.image, '', cardInfo.backupImage));
    cardBody.appendChild(createElementWithText('span', 'card-title', cardInfo.title));

    if (cardInfo.subtitle) {
        cardBody.appendChild(createElementWithText('span', 'card-sub', cardInfo.subtitle));
    }
    if (cardInfo.areas) {
        cardBody.appendChild(createElementWithText('span', 'card-areas', cardInfo.areas));
    }
    if (cardInfo.season) {
        cardBody.appendChild(createElementWithText('span', 'season', 'Best time: ' + cardInfo.season));
    }

    button.appendChild(cardBody);
    listItem.appendChild(button);
    return listItem;
}

// Puts a list of card <li> elements into a <ul class="card-grid">.
// cards: array of <li> elements, extraClass: string ('' for none). Returns the <ul>.
function createCardGrid(cards, extraClass) {
    const grid = createElementWithText('ul', 'card-grid ' + extraClass);
    for (const card of cards) {
        grid.appendChild(card);
    }
    return grid;
}

// Creates a <section> with an <h2> and an optional paragraph.
// title: string, text: string ('' for none). Returns the <section>.
function createSection(title, text) {
    const section = document.createElement('section');
    section.appendChild(createElementWithText('h2', '', title));
    if (text) {
        section.appendChild(createElementWithText('p', '', text));
    }
    return section;
}


/* ---------- Pieces of the Step 3 route page ---------- */

// Adds up the nights for every stop on a route.
// stops: array of { nights: number }. Returns the total as a number.
function countNights(stops) {
    let totalNights = 0;
    for (const stop of stops) {
        totalNights += stop.nights;
    }
    return totalNights;
}

// Creates one table row for a stop: place name, nights and highlights.
// stop: { place, nights, highlights }. Returns the <tr>.
function createStopRow(stop) {
    const row = document.createElement('tr');
    const placeCell = createElementWithText('th', '', stop.place);

    placeCell.scope = 'row';
    row.appendChild(placeCell);
    row.appendChild(createElementWithText('td', 'nights', String(stop.nights)));
    row.appendChild(createElementWithText('td', '', stop.highlights));
    return row;
}

// Creates the header row of the route table.
// Returns the <thead>.
function createRouteTableHead() {
    const tableHead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const columnNames = ['Stop', 'Nights', 'Highlights'];

    for (const columnName of columnNames) {
        const headerCell = createElementWithText('th', '', columnName);
        headerCell.scope = 'col';
        headerRow.appendChild(headerCell);
    }
    tableHead.appendChild(headerRow);
    return tableHead;
}

// Creates the "Total" row that adds up the nights and counts the stops.
// stops: array of stop objects. Returns the <tfoot>.
function createRouteTableFoot(stops) {
    const tableFoot = document.createElement('tfoot');
    const totalRow = document.createElement('tr');

    totalRow.appendChild(createElementWithText('td', '', 'Total'));
    totalRow.appendChild(createElementWithText('td', 'nights', String(countNights(stops))));
    totalRow.appendChild(createElementWithText('td', '', stops.length + ' stops'));
    tableFoot.appendChild(totalRow);
    return tableFoot;
}

// Creates the full route table inside a wrapper that scrolls sideways on phones.
// region: a region object from the JSON. Returns the wrapper <div>.
function createRouteTable(region) {
    const wrapper = createElementWithText('div', 'table-wrap');
    const table = document.createElement('table');
    const tableBody = document.createElement('tbody');

    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Route table, scrolls sideways on small screens');

    table.appendChild(createElementWithText('caption', '', region.routeOrder));
    table.appendChild(createRouteTableHead());
    for (const stop of region.stops) {
        tableBody.appendChild(createStopRow(stop));
    }
    table.appendChild(tableBody);
    table.appendChild(createRouteTableFoot(region.stops));

    wrapper.appendChild(table);
    return wrapper;
}

// Creates the "Where to stay" list.
// stays: array of strings. Returns the <section>.
function createStaySection(stays) {
    const section = document.createElement('section');
    const stayList = document.createElement('ul');

    section.appendChild(createElementWithText('h3', '', 'Where to stay'));
    for (const stay of stays) {
        stayList.appendChild(createElementWithText('li', '', stay));
    }
    section.appendChild(stayList);
    return section;
}

// Creates the "At a glance" box (best time, budget, getting around, flights).
// glanceItems: array of { label, text }. Returns the <aside>.
function createGlanceAside(glanceItems) {
    const aside = document.createElement('aside');
    const glanceBox = createElementWithText('div', 'glance');

    aside.appendChild(createElementWithText('h3', '', 'At a glance'));
    for (const item of glanceItems) {
        const paragraph = document.createElement('p');
        paragraph.appendChild(createElementWithText('strong', '', item.label + ':'));
        paragraph.appendChild(document.createTextNode(' ' + item.text));
        glanceBox.appendChild(paragraph);
    }
    aside.appendChild(glanceBox);
    return aside;
}

// Creates an image with a caption underneath.
// src, alt, captionText, backupSrc: strings. Returns the <figure>.
function createFigure(src, alt, captionText, backupSrc) {
    const figure = document.createElement('figure');
    figure.appendChild(createImage(src, alt, backupSrc));
    figure.appendChild(createElementWithText('figcaption', '', captionText));
    return figure;
}


/* ---------- Updating the page ---------- */

// Changes the big header title, the tagline under it, and the browser tab title.
// title, tagline: strings.
function updatePageHeading(title, tagline) {
    document.getElementById(ELEMENT_IDS.heading).textContent = title;
    document.getElementById(ELEMENT_IDS.tagline).textContent = tagline;
    document.title = title + ' | ' + SITE_NAME;
}

// Highlights the current step in the progress bar and marks earlier steps as done.
// currentStep: number from 1 to 3.
function updateProgressSteps(currentStep) {
    const stepItems = document.querySelectorAll('#' + ELEMENT_IDS.steps + ' li');

    stepItems.forEach((stepItem, index) => {
        const stepNumber = index + 1;
        stepItem.classList.toggle('done', stepNumber < currentStep);
        stepItem.classList.toggle('current', stepNumber === currentStep);
        if (stepNumber === currentStep) {
            stepItem.setAttribute('aria-current', 'step');
        } else {
            stepItem.removeAttribute('aria-current');
        }
    });
}

// Replaces everything in the app area with new elements.
// If moveFocus is true, focus jumps to the new heading so keyboard and
// screen reader users know the content changed.
// newElements: array of elements, moveFocus: boolean.
function showContent(newElements, moveFocus) {
    const app = document.getElementById(ELEMENT_IDS.app);

    app.innerHTML = '';
    for (const element of newElements) {
        app.appendChild(element);
    }

    if (moveFocus) {
        const firstHeading = app.querySelector('h2');
        firstHeading.tabIndex = -1;
        firstHeading.focus();
    }
}


/* ---------- The three steps ---------- */

// Step 3: shows the full 30-day route for one region.
// tripType, region: objects from the JSON.
// onBackToRegions, onStartOver: functions for the two back buttons.
function renderRoute(tripType, region, onBackToRegions, onStartOver) {
    const backButton = createButton('← Back to ' + tripType.name + ' regions', 'button back-button', onBackToRegions);
    const routeSection = createSection(region.name + ': ' + region.tagline, region.intro);
    const details = createElementWithText('div', 'details');
    const routeLinks = createElementWithText('div', 'route-actions');
    const infoLink = createElementWithText('a', '', 'Packing, visas and etiquette →');

    routeSection.appendChild(createFigure(region.image, region.imageAlt,
        'Stops: ' + region.areas.join(', ') + '.', tripType.image));
    routeSection.appendChild(createRouteTable(region));

    details.appendChild(createStaySection(region.stays));
    details.appendChild(createGlanceAside(region.glance));

    infoLink.href = 'info.html';
    routeLinks.appendChild(createButton('Pick a different trip type', 'button button-outline', onStartOver));
    routeLinks.appendChild(infoLink);

    updatePageHeading('30-Day ' + tripType.name + ' Route: ' + region.name,
        region.areas.join(', ') + ' · Best time: ' + region.season);
    updateProgressSteps(3);
    showContent([backButton, routeSection, details, routeLinks], true);
}

// Step 2: shows the regions for the trip type the user picked.
// tripType: object from the JSON. onStartOver: function that goes back to Step 1.
function renderRegions(tripType, onStartOver) {
    const backButton = createButton('← All trip types', 'button back-button', onStartOver);
    const aboutSection = createSection(tripType.name + ' trips', tripType.description);
    const regionSection = createSection('Step 2: Pick a region', '');

    const regionCards = tripType.regions.map((region) => {
        const showThisRoute = () => {
            renderRoute(tripType, region, () => renderRegions(tripType, onStartOver), onStartOver);
        };
        return createCard({
            title: region.name,
            subtitle: region.tagline,
            areas: region.areas.join(', '),
            season: region.season,
            image: region.image,
            backupImage: tripType.image
        }, showThisRoute);
    });

    const tripTypeImage = createImage(tripType.image, tripType.imageAlt, '');
    tripTypeImage.className = 'section-image';
    aboutSection.insertBefore(tripTypeImage, aboutSection.children[1]);
    regionSection.appendChild(createCardGrid(regionCards, ''));

    updatePageHeading(tripType.name + ' Trips', 'Step 2: choose where you want to go (' + tripType.tagline + ').');
    updateProgressSteps(2);
    showContent([backButton, aboutSection, regionSection], true);
}

// Step 1: shows the four trip types.
// tripTypes: array of trip type objects. moveFocus: boolean (false on first page load).
function renderTripTypes(tripTypes, moveFocus) {
    const typeSection = createSection('Step 1: Pick a trip type',
        'Choose the kind of trip you want. Next you will pick a region, then get your full route.');

    const typeCards = tripTypes.map((tripType) => {
        return createCard({
            title: tripType.name,
            subtitle: tripType.tagline,
            image: tripType.image
        }, () => renderRegions(tripType, () => renderTripTypes(tripTypes, true)));
    });

    typeSection.appendChild(createCardGrid(typeCards, 'four'));

    updatePageHeading('Find Your Route', 'Step 1: pick the kind of trip you want.');
    updateProgressSteps(1);
    showContent([typeSection], moveFocus);
}

// Finds the trip type whose id matches typeId (for links like routes.html#ski).
// Returns the trip type object, or undefined if none match.
function findTripType(tripTypes, typeId) {
    return tripTypes.find((tripType) => tripType.id === typeId);
}

// Starts the app once the data has loaded. If the page address ends in a trip
// type (for example #ski from a home page card), it opens that trip type first.
// tripTypes: array of trip type objects.
function startApp(tripTypes) {
    const linkedTripType = findTripType(tripTypes, window.location.hash.slice(1));

    if (linkedTripType) {
        renderRegions(linkedTripType, () => renderTripTypes(tripTypes, true));
    } else {
        renderTripTypes(tripTypes, false);
    }
}


/* ---------- Loading the data ---------- */

// Shows a loading message while the route data downloads.
function renderLoading() {
    const loadingMessage = createElementWithText('p', 'status-message', 'Loading routes…');
    loadingMessage.setAttribute('role', 'status');
    showContent([loadingMessage], false);
}

// Shows a friendly error message with a "Try again" button.
// onRetry: function that tries loading the data again.
function renderLoadError(onRetry) {
    const errorBox = createElementWithText('div', 'error-message');
    errorBox.setAttribute('role', 'alert');
    errorBox.appendChild(createElementWithText('p', '',
        'Sorry, the routes could not be loaded. Check your internet connection and try again.'));
    errorBox.appendChild(createButton('Try again', 'button', onRetry));
    showContent([errorBox], false);
}

// Downloads the route data with fetch().
// Returns a Promise that resolves to the array of trip types.
function fetchRouteData() {
    return fetch(DATA_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Request for ' + DATA_URL + ' failed with status ' + response.status);
            }
            return response.json();
        })
        .then((data) => data.tripTypes);
}

// Loads the data and starts the app, or shows an error if loading fails.
function loadRoutes() {
    renderLoading();
    fetchRouteData()
        .then(startApp)
        .catch(() => renderLoadError(loadRoutes));
}

loadRoutes();
