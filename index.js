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
    console.log("getting planets page " + page);
    const finalPlanets = [];
    return swapiGet(`planets/?page=${page}`)
    .then(json => {
	if (json.next !== null) {
	    return getPlanets(++page);
	} 
	console.log(finalPlanets);
	return json.results;
    });
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

function renderPlanet(planetId) {
    const mainEle = clearMainEle();

    getPlanet(planetId)
    .then(planet => {
	mainEle.append(`<h1>${planet.name}</h1>`);
	mainEle.append(`<p>${planet.name} is a ${planet.climate} ${planet.terrain} planet with a population of ${planet.population}. Some notable residents include ${getDigestibleResidents(planet)}. The planet is ${planet.surface_water}% water and ${100-planet.surface_water}% land.</h1>`);
	mainEle.append('<ul>');
	mainEle.append(`<li>Diameter: ${planet.diameter}km</li>`);
	mainEle.append(`<li>Gravity: ${planet.gravity}</li>`);
	mainEle.append(`<li>Rotational Period: ${planet.rotational_period} hours</li>`);
	mainEle.append(`<li>Orbital Period: ${planet.orbital_period} days</li>`);
	mainEle.append('</ul>');
    });
}

function getDigestibleResidents(planet) {
    return '<a href="#">Luke Skywalker</a>, <a href="#">C-3P0</a>, and <a href="#">Darth Vader</a>';
}

function init() {
    renderPlanetList();
}

$(init);
