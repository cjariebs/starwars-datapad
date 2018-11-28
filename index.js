'use strict';
// -----------------------------------------------------------------------------
// SWAPI Handlers

function swapiGet(identifier) {
    const uri = 'https://swapi.co/api/' + identifier;
    //console.log(`swapiGet ${uri}`);
    
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
	return Promise.reject('invalid resorce');
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

// returns a resource from the https://swapi.co/api/resource/id format
function getResourceFromUrl(url) {
    return swapiGet((url.split('/api/'))[1]);
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

    console.log(`rendering ${validResource} list (page ${page})`);

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

    console.log(`rendering ${validResource}/${params}`);

    location.hash = `#${validResource}/${params}`;

    switch (resource) {
	case 'planets':
	    renderPlanet(params);
	    break;
	case 'people':
	    renderPerson(params);
	    break;
        case 'species':
            renderSpecies(params);
            break;
        case 'starships':
            renderStarship(params);
            break;
        case 'vehicles':
            renderVehicle(params);
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
    });
}

function getDigestiblePersonInfo(person) {
    let promises = [];

    promises.push(getResourceFromUrl(person.species[0])
    .then(json => {
	return json;
    }));
   
    promises.push(getResourceFromUrl(person.homeworld)
    .then(json => {
	return json;
    }));
    
    if (person.starships.length > 0) {
	const starships = person.starships.map(url => {
	    return getResourceFromUrl(url)
	    .then(json => {
		return json;
	    });
	});
	promises = promises.concat(Promise.all(starships));
    } else {
	promises.push([]);
    }

    if (person.vehicles.length > 0) {
	const vehicles = person.vehicles.map(url => {
	    return getResourceFromUrl(url)
	    .then(json => {
		return json;
	    });
	});
	promises = promises.concat(Promise.all(vehicles));
    } else {
	promises.push([]);
    }

    return Promise.all(promises);
}

function renderDigestiblePersonInfo(person) {
    getDigestiblePersonInfo(person).then(digest => {
	renderDigestiblePersonSpecies(digest[0]);
        renderDigestiblePersonHomeworld(digest[1]);
        renderDigestiblePersonStarships(digest[2]);
        renderDigestiblePersonVehicles(digest[3]);
    });
}

function renderDigestiblePersonSpecies(species) {
    $('.digestibleSpecies').html(`<a href="#species/${species.name}">${species.name}</a>`);
}

function renderDigestiblePersonHomeworld(homeworld) {
    $('.digestibleHomeworld').html(`<a href="#planets/${homeworld.name}">${homeworld.name}</a>`);
}

function renderDigestiblePersonStarships(starships) {
    let html = '';
    if (starships.length == 0) {
	html += '<li>None</li>';
    }

    starships.forEach(ship => {
	html += `<li><a href="#starships/${ship.name}">${ship.name}</a></li>`;
    });

    $('.digestibleStarships').html(html);
}

function renderDigestiblePersonVehicles(vehicles) {
    let html = '';
    if (vehicles.length == 0) {
	html += '<li>None</li>';
    }

    vehicles.forEach(vehicle => {
	html += `<li><a href="#vehicles/${vehicle.name}">${vehicle.name}</a></li>`;
    });

    $('.digestibleVehicles').html(html);

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
	return getResourceFromUrl(url)
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

function renderSpecies(id) {
    const pane = readyMainPane();
    getResource('species', id)
    .then(species => {
        console.log(species);
        const lifespan = Number.parseInt(species.average_lifespan).toLocaleString();

        pane.html(`
            <h1>${species.name}</h1>
            <h2>${species.designation} ${species.classification}</h2>
            <ul>
                <li>Homeworld: <span class="digestibleHomeworld"></span></li>
                <li>Language: ${species.language}</li>
                <li>Average height: ${species.average_height}cm</li>
                <li>Skin colors: ${species.skin_colors}</li>
                <li>Hair colors: ${species.hair_colors}</li>
                <li>Eye colors: ${species.eye_colors}</li>
                <li>Average lifespan: ${lifespan} years</li>
            </ul>
            <h3>Notable ${species.name}s:</h3>
            <ul class="digestiblePeople"></ul>
        `);
    });
}

function renderStarship(id) {
    const pane = readyMainPane();
    getResource('starships', id)
    .then(starship => {
        console.log(starship);
        const cost = Number.parseInt(starship.cost_in_credits).toLocaleString();
        const cargo = Number.parseInt(starship.cargo_capacity).toLocaleString();
        const len = Number.parseFloat(starship.length).toLocaleString();
        const crew = Number.parseInt(starship.crew).toLocaleString();
        const passengers = Number.parseInt(starship.passengers).toLocaleString();

        pane.html(`
            <h1>${starship.name}</h1>
            <h2>${starship.model}</h2>
            <ul>
                <li>Manufacturer: ${starship.manufacturer}</li>
                <li>Class: ${starship.starship_class}</li>
                <li>Price: ${cost}cr</li>
                <li>Length: ${len} meters</li>
                <li>Crew: ${crew}</li>
                <li>Passengers: ${passengers}</li>
                <li>Cargo Capacity: ${cargo}kg</li>
                <li>Supply Capacity: ${starship.consumables}</li>
                <li>Hyperdrive Rating: ${starship.hyperdrive_rating}</li>
                <li>Max. Atmospheric Speed: ${starship.max_atmosphering_speed}</li>
            </ul>
            <h3>Known Pilots:</h3>
            <ul class="digestiblePilots"></ul>
        `);
        renderDigestibleStarshipPilots(starship);
    });
}

function getDigestibleStarshipPilots(starship) {

}

function renderDigestibleStarshipPilots(starship) {

}

function renderVehicle(id) {
    const pane = readyMainPane();
    getResource('vehicles', id)
    .then(vehicle => {
        console.log(vehicle);
        const cost = Number.parseInt(vehicle.cost_in_credits).toLocaleString();
        const cargo = Number.parseInt(vehicle.cargo_capacity).toLocaleString();
        const len = Number.parseFloat(vehicle.length).toLocaleString();
        const crew = Number.parseInt(vehicle.crew).toLocaleString();
        const passengers = Number.parseInt(vehicle.passengers).toLocaleString();

        pane.html(`
            <h1>${vehicle.name}</h1>
            <h2>${vehicle.model}</h2>
            <ul>
                <li>Manufacturer: ${vehicle.manufacturer}</li>
                <li>Class: ${vehicle.vehicle_class}</li>
                <li>Price: ${cost}cr</li>
                <li>Length: ${len} meters</li>
                <li>Crew: ${crew}</li>
                <li>Passengers: ${passengers}</li>
                <li>Cargo Capacity: ${cargo}kg</li>
                <li>Supply Capacity: ${vehicle.consumables}</li>
                <li>Max. Atmospheric Speed: ${vehicle.max_atmosphering_speed}</li>
            </ul>
            <h3>Known Pilots:</h3>
            <ul class="digestiblePilots"></ul>
        `);
        renderDigestibleVehiclePilots(vehicle);
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

