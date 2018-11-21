'use strict';
function swapiGet(identifier) {
    const uri = 'https://swapi.co/api/' + identifier;

    return fetch(uri)
	.then(response => {
	    if (response.ok)
		return response.json();
	    else
		throw new Error(response.statusText);
	});
}

function getPlanets(page=1) {
    return swapiGet(`planets/?page=${page}`)
}

function getPlanet(planetId) {
    return swapiGet(`planets/${planetId}`);
}

function clearMainEle() {
    const mainEle = $('main');
    mainEle.html('');
    return mainEle;
}

function renderPlanetList() {
    const mainEle = clearMainEle();

    getPlanets()
    .then(planets => {
	console.log(planets);
	mainEle.append('<ul>');
	for (let i=0; i < planets.length; i++) {
	    mainEle.append(`<li>${planets[i].name}</li>`);
	}
	mainEle.append('</ul>');

    });
}

function getDetailPane() {
    return $('#detailPane');
}

function getListPane() {
    return $('#listPane');
}

function readyListPane() {
    const listPane = getListPane(); 
    listPane.html('');
    listPane.removeClass('hidden');
    getDetailPane().addClass('hidden');
    return listPane;
}

function readyDetailPane() {
    const detailPane = getDetailPane(); 
    detailPane.html('');
    detailPane.removeClass('hidden');
    getListPane().addClass('hidden');
    return detailPane;
}
function renderPlanet(planetId=1) {
    const detailPane = readyDetailPane();

    getPlanet(planetId)
    .then(planet => {
	detailPane.append(`<h1>${planet.name}</h1>
	<p>${planet.name} is a ${planet.climate} ${planet.terrain} planet with a population of ${planet.population}. Some notable residents include ${getDigestibleResidents(planet)}. The planet is ${planet.surface_water}% water and ${100-planet.surface_water}% land.</p>
	<ul>
	<li>Diameter: ${planet.diameter}km</li>
	<li>Gravity: ${planet.gravity}</li>
	<li>Rotational Period: ${planet.rotational_period} hours</li>
	<li>Orbital Period: ${planet.orbital_period} days</li>
	</ul>`);
    });
}

function getDigestibleResidents(planet) {
    return '<a href="#">Luke Skywalker</a>, <a href="#">C-3P0</a>, and <a href="#">Darth Vader</a>';
}

function init() {
    renderPlanet();
}

$(init);
