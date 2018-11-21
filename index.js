'use strict';
// -------------------------------------------------------------------------
// Game State

const _gameState = {
    action: 'goto_location',
};

// -------------------------------------------------------------------------
// Player State

const _playerInfo = {
    name: "Makaec Aurai",
    credits: 100000,
    inventory: [],
    location: 'Space',
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
// Render Functions

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

function renderPlanetList(contentPane) {
    getPlanets()
    .then(planets => {
	console.log(planets);
	contentPane.append('<ul>');
	for (let i=0; i < planets.results.length; i++) {
	    let planet = planets.results[i];
	    contentPane.append(`<li>${planet.name}</li>`);
	}
	contentPane.append('</ul>');
    });
}

function renderGameState() {
    const content = $('.gameContent');
    content.html('');

    if (_gameState.action == 'overview') {
        content.append(`<p>You are in ${getPlayerLocation()}. What would you like to do?</p>`);
    }

    if (_gameState.action == 'goto_location') {
	content.append(`<p>Where would you like to go?</p>`);
	renderPlanetList(content);
    }


}

function render() {
    renderPlayerInfo();
    renderGameState();
}

// -------------------------------------------------------------------------
// Handle Game State

function gameAction(action) {
    switch(action) {
	case 'goto_location':
	    _gameState.action = 'goto_location';
	    break;
	default:
	    _gameState.action = 'overview';
	    break;
    }
}

// ------------------------------------------------------------------------
// SWAPI Handlers

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
    return swapiGet('planets');
}

function getPlanet(planetId) {
    return swapiGet(`planets/${planetId}`);

}

function getShips() {
    return swapiGet('starships');

}

function getShip(shipId) {
    return swapiGet(`starships/${shipId}`);

}

function buyShip() {

}

function showShip(shipId) {
    getShip(shipId)
    .then();

}

function showPlanet(planetId) {
    getPlanet(planetId)
    .then();

}

function gotoPlanet() {

}

// ------------------------------------------------------------------------
// jQuery and App Init

function init() {
    handleInput();
    render();
}

function handleInput() {

}

$(init);
