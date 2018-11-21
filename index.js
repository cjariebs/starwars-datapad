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
    return swapiGet(`planets/?page=${page}`);
}

function getPlanet(planetId) {
    return swapiGet(`planets/${planetId}`);
}

function readyMainPane() {
    const mainPane = $('main');
    mainPane.html('');
    return mainPane;
}

function renderPlanetList() {
    const pane = readyMainPane();

    getPlanets()
    .then(json => {
	const planets = json.results;
	console.log(planets);

	let html = '<ul>';
	for (let i=0; i < planets.length; i++) {
	    html += `<li><a href="#planet">${planets[i].name}</a></li>`;
	}
	html += '</ul>';

	// TODO: parse URL to get current page and to reconstruct local uri
	if (json.prev) {
	    html += `<a href="${json.prev}">Previous</a>`;
	}

	html += ` Showing 10 of ${json.count} results `;

	if (json.next) {
	    html += `<a href="${json.next}">Next</a>`;
	}

	pane.html(html);
    });
}

function renderPlanet(planetId=1) {
    const pane = readyMainPane();

    getPlanet(planetId)
    .then(planet => {
	pane.html(`<h1>${planet.name}</h1>
	<p>${planet.name} is a ${planet.climate} ${planet.terrain} planet with a population of ${planet.population}. Some notable residents include ${getDigestibleResidents(planet)}. The planet is ${planet.surface_water}% water and ${100-planet.surface_water}% land.</p>
	<ul>
	<li>Diameter: ${planet.diameter}km</li>
	<li>Gravity: ${planet.gravity}</li>
	<li>Rotation Period: ${planet.rotation_period} hours</li>
	<li>Orbital Period: ${planet.orbital_period} days</li>
	</ul>`);
    });
}

function getDigestibleResidents(planet) {
    return '<a href="#">Luke Skywalker</a>, <a href="#">C-3P0</a>, and <a href="#">Darth Vader</a>';
}

function init() {
    renderPlanetList();
}

$(init);
