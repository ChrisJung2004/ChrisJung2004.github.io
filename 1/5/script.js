'use strict';

function loadBoardingData() {
    fetch('js/boardingData.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            updatePage(data);
        })
        .catch(function(err) {
            console.error(err);
        });
}

function updatePage(data) {
    document.title = data.title;
    document.querySelector('#styleName').textContent = data.header;

    document.querySelector('#heroTitle').textContent = data.hero.headline;
    document.querySelector('#heroDesc').textContent = data.hero.description;
    updateHeroImage(data.hero.image);

    updateSection('sec1', data.sections.overview);
    updateSection('sec2', data.sections.equipment);
}

function updateSection(prefix, sectionData) {
    document.querySelector('#' + prefix + 'Title').textContent = sectionData.title;
    document.querySelector('#' + prefix + 'Subtitle').textContent = sectionData.subtitle;

    let cards = document.querySelectorAll('#' + prefix + 'Grid .card');
    for (let i = 0; i < cards.length; i++) {
        cards[i].querySelector('h3').textContent = sectionData.cards[i].title;
        cards[i].querySelector('p').textContent = sectionData.cards[i].description;
    }
}

function updateHeroImage(imagePath) {
    let hero = document.querySelector('#heroSection');
    hero.style.setProperty('--hero-img', "url('" + imagePath + "')");
}

let changeButton = document.querySelector('#changeThemeBtn');
changeButton.addEventListener('click', loadBoardingData);
