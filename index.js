'use strict';
const _playerInfo = {
    name: "Makaec Aurai",
    credits: 100000,
    inventory: [],
    location: "Tattooine",
    currentShip: "Slave I",
};

function getPlayerName() {
    return _playerInfo.name;
}

function getPlayerCredits() {
    return _playerInfo.credits;
}

function getPlayerLocation() {
    return _playerInfo.location;
}

// -------------------------------------------------------------------------

function renderPlayerInfo() {
    renderPlayerCard();
    renderPlayerLocation();
}

function renderPlayerCard() {
    const card = $('.playerCard');
    card.html(`<h1>${getPlayerName()}</h1>
    	   <h2>${getPlayerCredits()}</h2>`);

}

function renderPlayerLocation() {
    const loc = $('.playerLocation');
    loc.html(`<h1>${getPlayerLocation()}</h1>`);

}

function renderGameContent() {
    const content = $('.gameContent');

}

function render() {
    renderPlayerInfo();
    renderGameContent();
}

// ------------------------------------------------------------------------

function swapiGet(identifier) {
    const uri = 'https://swapi.co/api/' + identifier;

    return fetch(uri)
	.then(response => {
	    if (response.ok) {
		return response.json();
	    }

	    throw new Error(response.statusText);
	});
}


function getPlanets() {
    return swapiGet('planets')
    .then(json => {
	console.log(json);
    });
}

function getShips() {

}

function buyShip() {

}

function showShip() {

}

function showPlanet() {

}

function gotoPlanet() {

}

// ------------------------------------------------------------------------

function init() {
    handleInput();
    render();
}

function handleInput() {

}

$(init);
