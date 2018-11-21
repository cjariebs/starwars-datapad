'use strict';
$(() => {

    const _playerInfo = {
	name: "Makaec Aurai",
	credits: 100000,
	inventory: [],
	location: "Tattooine",
	currentShip: "Slave I",
    };
    
    function renderPlayerInfo() {
	renderPlayerCard();
	renderPlayerLocation();
    }

    function renderPlayerCard() {
	const card = $('.playerCard');

    }

    function renderPlayerLocation() {
	const loc = $('.playerLocation');

    }

    function renderGameContent() {
	const content = $('.gameContent');

    }

    function render() {
	renderPlayerInfo();
	renderGameContent();
    }

    // ------------------------------------------------------------------------

    function getPlanets() {

    }

    function getShips() {

    }

    function buyShip() {

    }

    function showShip() {

    }

    function showPlanet() {

    }

    function flyToPlanet() {

    }
});

