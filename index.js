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

function uriToState(uri) {
    console.log(`uriToState: ${uri}`);
    // remove # from beginning of uri
    uri = uri.replace(/^#/,'');
    const split = uri.split('/');
    const locator = split.shift();
    const params = split;

    const validResources = ['', 'planet', 'planets', 'starships', 'starship', 'species', 'people', 'person', 'vehicles', 'vehicle'];

    //console.log(`locator ${locator}`);
    //console.log(`params ${params}`);

    if (validResources.indexOf(locator) == -1) {
	// error case, locator is not valid
	return;
    }

    let query = uri.split('?');
    if (query.length > 1) {
	query = query.pop();
	//console.log(`query ${query}`);
    } else {
	query = '';
    }
    
    switch (locator) {
	case '':
	    // no args - welcome page
	    renderWelcomePage();
	    break;

	case 'planets':
	case 'planet':
	    // '#planets' no args - list mode
	    if (params == '') {
		const page = getPageFromQuery(query);
		renderPlanetList(page);
	    } else {
		renderPlanet(params);
	    } 
	    break;
    }
}
		
function getPageFromQuery(query) {
    let page = 1;
    if (query !== '') {
	page = (query.split('='))[1];
	if (Number.isNaN(page)) {
	    page = 1;
	}
    }
    return page;
}

function getPlanets(page=1) {
    return swapiGet(`planets/?page=${page}`);
}

function getPlanet(planetId) {
    // if params is NaN then use search mode
    if (Number.isNaN(Number.parseInt(planetId))) {
	console.log('search mode');
	return swapiGet(`planets/?search=${planetId}`)
        .then(json => {
            return json.results[0];
	});
    } else {
	console.log('id mode');
        return swapiGet(`planets/${planetId}`);
    }
}

function readyMainPane() {
    const mainPane = $('main');
    mainPane.html('');
    return mainPane;
}

function renderWelcomePage() {
    console.log('rendering welcome page');
    const pane = readyMainPane();

    pane.html('<h1>Welcome</h1>');
}

function renderPlanetList(page=1) {
    console.log(`rendering planet list at page ${page}`);
    const pane = readyMainPane();
    
    location.hash = `#planets/?page=${page}`;

    getPlanets(page)
    .then(json => {
	const planets = json.results;
	console.log(planets);

	let html = '<ul>';
	for (let i=0; i < planets.length; i++) {
	    html += `<li><a href="#planet/${planets[i].name}">${planets[i].name}</a></li>`;
	}
	html += '</ul>';

	if (json.prev) {
	    html += `<a href="#planets/?page=${page-1}">Previous</a>`;
	}

	html += ` Showing ${1+((page-1)*10)}-${(1+((page-1)*10))+(planets.length-1)} of ${json.count} results `;

	if (json.next) {
	    html += `<a href="#planets/?page=${page+1}">Next</a>`;
	}

	pane.html(html);
    });
}

function renderPlanet(planetId) {
    const pane = readyMainPane();

    location.hash = `#planets/${planetId}`;

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

function setupUriHandler() {
    $(window).on('hashchange', event => {
	uriToState(location.hash);	
    });
}

function init() {
    setupUriHandler();
    uriToState(location.hash);
}

$(init);

