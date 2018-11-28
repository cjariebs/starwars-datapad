'use strict';
// -----------------------------------------------------------------------------
// SWAPI Handlers

function swapiGet(identifier) {
    const uri = 'https://swapi.co/api/' + identifier;
    console.log(`swapiApi ${uri}`);
    
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
	return Promise.reject('invalid resource');
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

// -----------------------------------------------------------------------------
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

    let query = uri.split('?');
    if (query.length > 1) {
	query = query.pop();
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
	pane.html(`
	    <h1>${person.name}</h1>
	    <h2>${person.gender} <span class="digestibleSpecies"></span> from <span class="digestibleHomeworld"></span></h2>
	    <h3>Physical Attributes:</h3>
	    <ul>
	      <li>Height: ${person.height}cm</li>
	      <li>Mass: ${person.mass}kg</li>
	      <li>Hair color: ${person.hair_color}</li>
	      <li>Eye color: ${person.eye_color}</li>
	      <li>Skin color: ${person.skin_color}</li>
	    </ul>
	    <h3>Known Starships:</h3>
	    <ul class="digestibleStarships"></ul>
	    <h3>Known Vehicles:</h3>
	    <ul class="digestibleVehicles"></ul>
	`);
	renderDigestiblePersonInfo(person);
	console.log(person);
    });
}

function getResourceFromUrl(url) {
    return (url.split('/api/'))[1];
}

function getDigestiblePersonInfo(person) {
    console.log('getting digestible person');

    /*getResource('species', getResourceFromUrl(person.species))
    .then(json => {
	console.log(json);
	digest.species = json.name;
    });
   /* promises.push(getResource('planets', getResourceFromUrl(person.homeworld)));
    promises.push(person.starships.map(url => {
	return swapiGet(getResourceFromUrl(url))
	.then(json => {
	    return json;
	});
    }));
    promises.push(person.vehicles.map(url => {
	return swapiGet(getResourceFromUrl(url))
	.then(json => {
	    return json;
	});
    }));

    console.log(promises);

    return Promise.all(promises);*/
}

function renderDigestiblePersonInfo(person) {
    console.log('rendering digestible person');
    /*getDigestiblePersonInfo(person).then(digest => {
	console.log(digest);
	renderDigestiblePersonSpecies(digest.species);
        renderDigestiblePersonHomeworld(digest.homeworld);
        renderDigestiblePersonStarships(digest.starships);
        renderDigestiblePersonVehicles(digest.vehicles);
    });*/
}

function renderDigestiblePersonSpecies(species) {
    $('.digestibleSpecies').text(species);
}

function renderDigestiblePersonHomeworld(homeworld) {
    $('.digestibleHomeworld').text(homeworld);
}

function renderDigestiblePersonStarships(starships) {
    $('.digestibleStarships').text(starships);
}

function renderDigestiblePersonVehicles(vehicles) {
    $('.digestibleVehicles').text(vehicles);

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

	renderDigestiblePlanetResidents(planet);
    });
}

function getDigestiblePlanetResidents(planet) {
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

function renderDigestiblePlanetResidents(planet) {
    getDigestiblePlanetResidents(planet)
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

// -----------------------------------------------------------------------------
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

