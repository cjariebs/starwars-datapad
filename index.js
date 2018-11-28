'use strict';
function swapiGet(identifier) {
    const uri = 'https://swapi.co/api/' + identifier;
    //console.log(`swapiApi ${uri}`);
    
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
	    if (params == '' || query !== '') {
		renderPlanetList(getPageFromQuery(query));
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
	return swapiGet(`planets/?search=${planetId}`)
        .then(json => {
            return json.results[0];
	});
    } else {
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

function renderPlanetList(page) {
    console.log(`rendering planet list at page ${page}`);
    const pane = readyMainPane();

    page = Number.parseInt(page) || 1;
    
    location.hash = `#planets/?page=${page}`;

    getPlanets(page)
    .then(json => {
	console.log(json);
	let html = '<ul>';
	json.results.forEach(planet => {
	    html += `<li><a href="#planet/${planet.name}">${planet.name}</a></li>`;
	});
	html += '</ul>';

	if (json.previous) {
	    html += `<a href="#planets/?page=${page-1}">Previous</a>`;
	}

	const startIndex = 1+((page-1)*10);
	const endIndex = startIndex+(json.results.length-1);
	html += ` Showing ${startIndex}-${endIndex} of ${json.count} results `;

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
	const population = Number.parseInt(planet.population).toLocaleString();
	const diameter = Number.parseInt(planet.diameter).toLocaleString();

	pane.html(`<h1>${planet.name}</h1>
	<p>${planet.name} is a ${planet.climate} ${planet.terrain} planet with a population of ${population}. <span class="digestibleResidents"></span> The planet is ${planet.surface_water}% water and ${100-planet.surface_water}% land.</p>
	<ul>
	<li>Diameter: ${diameter}km</li>
	<li>Gravity: ${planet.gravity}</li>
	<li>Rotation Period: ${planet.rotation_period} hours</li>
	<li>Orbital Period: ${planet.orbital_period} days</li>
	</ul>`);

	renderDigestibleResidents(planet);
    });
}

function getDigestibleResidents(planet) {
    const residentPromises = planet.residents.map(url => {
	return swapiGet((url.split('/api/'))[1])
	.then(json => {
	    return json;
	});
    });

    return Promise.all(residentPromises)
    .then(result => {
	return result;
    });
}

function renderDigestibleResidents(planet) {
    getDigestibleResidents(planet)
    .then(residents => {
	if (residents.length == 0) {
	$('.digestibleResidents').html('There are no notable residents.');
	return;
	}

	let html = 'Some notable residents include ';
	residents.forEach((resident, i) => {
	    html += `<a href="#people/${resident.name}">${resident.name}</a>`;

	    if (i == residents.length-1) {
		html += '.';
	    } else {
	        if (residents.length == 2) {
		    html += " and ";
		}

	        if (residents.length > 2) {
		    html += ", ";
		    if (i == residents.length-2) {
			html += "and "
		    }
	        }
	    }
	});
	$('.digestibleResidents').html(html);
    });
}

function setupUriHandler() {
    $(window).on('hashchange', () => {
	uriToState(location.hash);	
    });
}

function init() {
    setupUriHandler();
    uriToState(location.hash);
}

$(init);

