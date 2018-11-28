'use strict';
// ----------------------------------------------------------------------------
// SWAPI Handlers

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

function validateResource(resource) {
    const validResources = ['planets', 'starships', 'species', 'people', 'vehicles'];

    if (validResources.indexOf(resource) == -1) {
	// error case, resource is not valid
	console.log(`invalid resource ${resource} specified`);
	return null;
    }

    return resource;
}

function getListResource(resource, page=1) {
    const validResource = validateResource(resource);
    if (!validResource) {
	return;
    }

    page = Number.parseInt(page) || 1;
    return swapiGet(`${resource}/?page=${page}`);
}

function getResource(resource, id=1) {
    const validResource = validateResource(resource);
    if (!validResource) {
	return;
    }

    // if params is NaN then use search mode
    if (Number.isNaN(Number.parseInt(id))) {
	return swapiGet(`${validResource}/?search=${id}`)
        .then(json => {
            return json.results[0];
	});
    } else {
        return swapiGet(`${validResource}/${id}`);
    }
}

// ----------------------------------------------------------------------------
// State + Render

function uriToState(uri) {
    console.log(`uriToState: ${uri}`);
    // remove # from beginning of uri
    uri = uri.replace(/^#/,'');
    const split = uri.split('/');
    const locator = split.shift();
    const params = split;

    const validResource = validateResource(locator);
    if (validResource === null) {
	renderWelcomePage();
	return;
    }

    //console.log(`params ${params}`);

    let query = uri.split('?');
    if (query.length > 1) {
	query = query.pop();
	//console.log(`query ${query}`);
    } else {
	query = '';
    }
    
    if (params == '' || query !== '') {
	renderListResource(validResource, getPageFromQuery(query));
    } else {
	renderResource(validResource, params);
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

function renderListResource(resource, page=1) {
    console.log(`rendering ${resource} list at page ${page}`);
    const validResource = validateResource(resource);
    if (!validResource) {
	renderWelcomePage();
	return;
    }

    const pane = readyMainPane();
    page = Number.parseInt(page) || 1;
    
    location.hash = `#${validResource}/?page=${page}`;
    getListResource(validResource, page).then(thenRender);

    function thenRender(json) {
	console.log(json);
	let html = '<ul>';
	json.results.forEach(item => {
	    html += `<li><a href="#${validResource}/${item.name}">${item.name}</a></li>`;
	});
	html += '</ul>';

	if (json.previous) {
	    html += `<a href="#${validResource}/?page=${page-1}">Previous</a>`;
	}

	const startIndex = 1+((page-1)*10);
	const endIndex = startIndex+(json.results.length-1);
	html += ` Showing ${startIndex}-${endIndex} of ${json.count} results `;

	if (json.next) {
	    html += `<a href="#${validResource}/?page=${page+1}">Next</a>`;
	}

	pane.html(html);
    }
}

function renderResource(resource, params) {
    console.log(`rendering resource ${resource} with params ${params}`);
    const validResource = validateResource(resource);
    if (!validResource) {
	renderWelcomePage();
	return;
    }

    location.hash = `#${validResource}/${params}`;

    switch (resource) {
	case 'planets':
	    renderPlanet(params);
	    break;
	case 'people':
	    renderPerson(params);
	    break;
    }
}


function renderPerson(id) {
    const pane = readyMainPane();

    getResource('people', id)
    .then(person => {
	pane.html(`<h1>${person.name}</h1>`);
    });
}

function renderPlanet(id) {
    const pane = readyMainPane();

    getResource('planets', id)
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

// ----------------------------------------------------------------------------
// jQuery + init

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

