let map, swissbbox;

let circularArea = {
    'center': [5.9814056, 46.7912769],
    'radius': 3,
    'options': { steps: 32, units: 'kilometers', properties: { foo: 'bar' } }
};

d3.json('./data_and_scripts/data/master.json', function(err, data) {
    if (err) throw error;
    console.log(data);

    data = d3.nest()
        .key(function(d) { return d.id })
        .key(function(d) { return d.survey_year })
        .entries(data);

    console.log(data);

    let item = d3.select('.list-container').selectAll('.item')


    item = item.data(data, function(d) { return d.id; });

    item.exit().remove();

    item = item.enter()
        .append('div')
        .classed('item py-3', true)
        .attr('id', function(d) { return d.key; })
        .html(function(d) {

            function fn(year) {
                let thisYear = d.values.filter(function(e) {
                    return e.key == year;
                })
                if (thisYear.length > 0)  {
                    return "";
                } else {
                    return "off";
                }
            }

            let thisHtml = `
					<div class="id field">
    					<div class="label">Id</div>
    					<div class="value">${d.values[0].values[0].id}</div>
    				</div>
    				<div class="canton field">
    					<div class="label">Canton</div>
    					<div class="value">${d.values[0].values[0].canton}</div>
    				</div>
    				<div class="city field">
    					<div class="label">City</div>
    					<div class="value">${d.values[0].values[0].city}</div>
    				</div>
    				<div class="institution field">
    					<div class="label">Landmark name</div>
    					<div class="value">${d.values[0].values[0].name_landmark}</div>
    				</div>
    				<div class="opening field">
    					<div class="label">Opened in (alternative)</div>
    					<div class="value">${d.values[0].values[0].opened} (${d.values[0].values[0].opened_alternative})</div>
    				</div>
    				<div class="closing field">
    					<div class="label">Closed in (Alternative)</div>
    					<div class="value">${d.values[0].values[0].closed} (${d.values[0].values[0].closed_alternative})</div>
    				</div>
    				<div class="surveyes field">
    					<div class="label">Surveyes</div>
    					<div class="value"><span class="${fn(1933)}">1933</span><span class="${fn(1940)}">1940's</span><span class="${fn(1954)}">1954</span><span class="${fn(1965)}">1965</span><span class="${fn(1980)}">1980</span></div>
    				</div>
			`;
            return thisHtml;
        })
        .on('click', function(d) {
            d3.selectAll('.item.active').classed('active', false);
            d3.select(this).classed('active', true);

            let selectionName = `${d.key} - name`;
            d3.select('.selected-institution .selected-name')
                .html(selectionName);

            d3.select('.selected-institution')
                .style('display', 'block');

            d3.select('.search-institution')
                .style('display', 'none');

            populateSidebar(d);
            console.log(d)
            console.log(d.values[0].values[0].longitude, d.values[0].values[0].latitude);

            map.flyTo({
                center: [d.values[0].values[0].longitude,
                    d.values[0].values[0].latitude
                ],
                zoom: 12,
            });

            console.log(map.getLayer('circular-area'))
            circularArea = {
                'center': [d.values[0].values[0].longitude, d.values[0].values[0].latitude],
                'radius': 5,
                'options': { steps: 32, units: 'kilometers', properties: { foo: 'bar' } }
            };

            if (map.getLayer('circular-area')) {
                map.getLayer('circular-area').setData(turf.circle(circularArea.center, circularArea.radius, circularArea.options))
            } else {
            		map.addSource("circular-area-source", turf.circle(circularArea.center, circularArea.radius, circularArea.options));
                map.addLayer({
                    'id': 'circular-area',
                    'type': 'fill',
                    'source': "circular-area-source",
                    'layout': {},
                    'paint': {
                        'fill-color': '#088',
                        'fill-opacity': 0.8
                    }
                });
            }
            // map.getLayer('circular-area').setData()





        })
        .merge(item);

    reset();

})

function searchList(value) {
    // Declare variables
    var input, filter, ul, li, a, i;

    input = document.getElementById('mySearchList');
    filter = input.value.toUpperCase();

    ul = document.getElementsByClassName("list-container");
    // console.log(ul)
    li = ul[0].getElementsByClassName('item');
    // console.log(li)

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {

        li[i].style.display = "none";

        value = li[i].getElementsByClassName("id")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        }

        value = li[i].getElementsByClassName("canton")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        }

        value = li[i].getElementsByClassName("city")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        }

        value = li[i].getElementsByClassName("institution")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        }

        value = li[i].getElementsByClassName("opening")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        }

        value = li[i].getElementsByClassName("closing")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        }

    }
}

function populateSidebar(data) {
    // console.log(data);

    function getValue(year, field) {
        // console.log(year, field, data)
        // console.log(data.values)
        let filtered = data.values.filter(function(e) {
            return e.key == year;
        })
        let value = '–'
        if (filtered.length > 0) {
            // console.log(filtered[0].values[0]);
            value = filtered[0].values[0][field];
        }
        return value;
    }


    let furtherInformations = ``;

    //Institution name
    thisTitle = 'Institution name';
    thisField = 'institution';
    furtherInformations += `
				<div class="row section-title"><div class="col-3"></div><div class="col-9">${thisTitle}</div></div>
        <div class="row values"><div class="col-3">1933</div><div class="col-9">${getValue(1933,thisField)}</div></div>
        <div class="row values"><div class="col-3">1940's</div><div class="col-9">${getValue(1940,thisField)}</div></div>
        <div class="row values"><div class="col-3">1954</div><div class="col-9">${getValue(1954,thisField)}</div></div>
        <div class="row values"><div class="col-3">1965</div><div class="col-9">${getValue(1965,thisField)}</div></div>
        <div class="row values"><div class="col-3">1980</div><div class="col-9">${getValue(1980,thisField)}</div></div>`;

    //Typologies
    thisTitle = 'Typologies';
    thisField = 'typologies';
    furtherInformations += `
				<div class="row section-title"><div class="col-3"></div><div class="col-9">${thisTitle}</div></div>
        <div class="row values"><div class="col-3">1933</div><div class="col-9">${getValue(1933,thisField)}</div></div>
        <div class="row values"><div class="col-3">1940's</div><div class="col-9">${getValue(1940,thisField)}</div></div>
        <div class="row values"><div class="col-3">1954</div><div class="col-9">${getValue(1954,thisField)}</div></div>
        <div class="row values"><div class="col-3">1965</div><div class="col-9">${getValue(1965,thisField)}</div></div>
        <div class="row values"><div class="col-3">1980</div><div class="col-9">${getValue(1980,thisField)}</div></div>`;

    //Confession
    thisTitle = 'Confession';
    thisField = 'confession';
    furtherInformations += `
				<div class="row section-title"><div class="col-3"></div><div class="col-9">${thisTitle}</div></div>
        <div class="row values"><div class="col-3">1933</div><div class="col-9">${getValue(1933,thisField)}</div></div>
        <div class="row values"><div class="col-3">1940's</div><div class="col-9">${getValue(1940,thisField)}</div></div>
        <div class="row values"><div class="col-3">1954</div><div class="col-9">${getValue(1954,thisField)}</div></div>
        <div class="row values"><div class="col-3">1965</div><div class="col-9">${getValue(1965,thisField)}</div></div>
        <div class="row values"><div class="col-3">1980</div><div class="col-9">${getValue(1980,thisField)}</div></div>`;

    //Accepted gender
    thisTitle = 'Accepted gender';
    thisField = 'accepted_gender';
    furtherInformations += `
				<div class="row section-title"><div class="col-3"></div><div class="col-9">${thisTitle}</div></div>
        <div class="row values"><div class="col-3">1933</div><div class="col-9">${getValue(1933,thisField)}</div></div>
        <div class="row values"><div class="col-3">1940's</div><div class="col-9">${getValue(1940,thisField)}</div></div>
        <div class="row values"><div class="col-3">1954</div><div class="col-9">${getValue(1954,thisField)}</div></div>
        <div class="row values"><div class="col-3">1965</div><div class="col-9">${getValue(1965,thisField)}</div></div>
        <div class="row values"><div class="col-3">1980</div><div class="col-9">${getValue(1980,thisField)}</div></div>`;

    //Funding agencies
    thisTitle = 'Funding agencies';
    thisField = 'funding_agency';
    furtherInformations += `
				<div class="row section-title"><div class="col-3"></div><div class="col-9">${thisTitle}</div></div>
        <div class="row values"><div class="col-3">1933</div><div class="col-9">${getValue(1933,thisField)}</div></div>
        <div class="row values"><div class="col-3">1940's</div><div class="col-9">${getValue(1940,thisField)}</div></div>
        <div class="row values"><div class="col-3">1954</div><div class="col-9">${getValue(1954,thisField)}</div></div>
        <div class="row values"><div class="col-3">1965</div><div class="col-9">${getValue(1965,thisField)}</div></div>
        <div class="row values"><div class="col-3">1980</div><div class="col-9">${getValue(1980,thisField)}</div></div>`;

    //Committing agencies
    thisTitle = 'Committing agencies';
    thisField = 'committing_agencies';
    furtherInformations += `
				<div class="row section-title"><div class="col-3"></div><div class="col-9">${thisTitle}</div></div>
        <div class="row values"><div class="col-3">1933</div><div class="col-9">${getValue(1933,thisField)}</div></div>
        <div class="row values"><div class="col-3">1940's</div><div class="col-9">${getValue(1940,thisField)}</div></div>
        <div class="row values"><div class="col-3">1954</div><div class="col-9">${getValue(1954,thisField)}</div></div>
        <div class="row values"><div class="col-3">1965</div><div class="col-9">${getValue(1965,thisField)}</div></div>
        <div class="row values"><div class="col-3">1980</div><div class="col-9">${getValue(1980,thisField)}</div></div>`;

    d3.select('.further-info').html(furtherInformations);
}

function reset() {
    // console.log('reset');
    d3.select('.selected-institution')
        .style('display', 'none')

    d3.select('.search-institution')
        .style('display', 'flex')

    searchList('');

    d3.selectAll('.item.active').classed('active', false);
    d3.select('.further-info').html('<p class="how-to text-center mt-5">Click on a facility in the list<br/>to show further details.</p>');

    if (map) {
        map.fitBounds([
            [
                swissbbox[0],
                swissbbox[1]
            ],
            [
                swissbbox[2],
                swissbbox[3]
            ]
        ]);
    }
}

$(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
        reset();
    }
});

var createGeoJSONCircle = function(center, radiusInKm, points) {
    if (!points) points = 64;

    var coords = {
        latitude: center[1],
        longitude: center[0]
    };

    var km = radiusInKm;

    var ret = [];
    var distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
    var distanceY = km / 110.574;

    var theta, x, y;
    for (var i = 0; i < points; i++) {
        theta = (i / points) * (2 * Math.PI);
        x = distanceX * Math.cos(theta);
        y = distanceY * Math.sin(theta);

        ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ret]
                }
            }]
        }
    };
};


$(document).ready(function() {
    d3.json('./data_and_scripts/data/ch.json', function(err, ch) {
        if (err) throw err;
        // console.log(ch);
        mapboxgl.accessToken = 'pk.eyJ1IjoiaW9zb25vc2VtcHJlaW8iLCJhIjoiOHpYSnpLQSJ9.2ZxP5dSbQhs-dH0PhXER9A';
        map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
            center: [5.9814056, 46.7912769], // starting position [lng, lat]46.7912769,5.9814056
            zoom: 1 // starting zoom
        });

        let swiss = topojson.feature(ch, ch.objects.country);
        swissbbox = topojson.bbox(ch, ch.objects.country);

        console.log(swiss)

        // let chbbox = turf.bboxPolygon(swiss);


        // console.log(chbbox)

        map.fitBounds([
            [
                swissbbox[0],
                swissbbox[1]
            ],
            [
                swissbbox[2],
                swissbbox[3]
            ]
        ]);

        map.on('load', function() {

            // var circle = turf.circle(circularArea.center, circularArea.radius, circularArea.options);

            // console.log(circle)

            // map.addLayer({
            //     'id': 'circular-area',
            //     'type': 'fill',
            //     'source': {
            //         'type': 'geojson',
            //         'data': turf.circle(circularArea.center, circularArea.radius, circularArea.options)
            //     },
            //     'layout': {},
            //     'paint': {
            //         'fill-color': '#088',
            //         'fill-opacity': 0.8
            //     }
            // });



        });


    })
});