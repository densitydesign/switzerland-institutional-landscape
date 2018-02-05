let map, swissbbox, master, sourcesData;

let circularArea = {
    'center': [5.9814056, 46.7912769],
    'radius': 5,
    'options': { steps: 64, units: 'kilometers', properties: { foo: 'bar' } }
};

function handleSelection(d) {
    // console.log(d)
    d3.selectAll('.item.active')
        .classed('active', false)

    d3.selectAll('.item')
        .filter(function(e) {
            return e.key == d.key;
        })
        .classed('active', true);

    let selectionName = `${d.key} - ${d.values[0].values[0].institution}`;
    d3.select('.selected-institution .selected-name')
        .html(selectionName);

    d3.select('.selected-institution')
        .style('display', 'block');

    d3.select('.search-institution')
        .style('display', 'none');

    populateSidebar(d);

    map.flyTo({
        center: [d.values[0].values[0].longitude,
            d.values[0].values[0].latitude
        ],
        zoom: 11,
    });

    circularArea.center = [d.values[0].values[0].longitude, d.values[0].values[0].latitude]

    if (!map.getSource("circular-area")) {

        map.addSource("circular-area", {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [turf.circle(circularArea.center, circularArea.radius, circularArea.options)]
            }
        });

        map.addLayer({
            'id': 'circular-area',
            'type': 'fill',
            'source': "circular-area",
            'layout': {},
            'paint': {
                'fill-color': '#B0C5CE',
                'fill-opacity': 0.2
            }
        });
        map.addLayer({
            'id': 'circular-area-stroke',
            'type': 'line',
            'source': "circular-area",
            'layout': {},
            'paint': {
                'line-color': '#B0C5CE',
                'line-width': 2
            }
        });
    } else {
        let newDataSource = {
            "type": "FeatureCollection",
            "features": [turf.circle(circularArea.center, circularArea.radius, circularArea.options)]
        }
        map.getSource("circular-area").setData(newDataSource)
    }
    map.setLayoutProperty("circular-area", 'visibility', 'visible');
    map.setLayoutProperty("circular-area-stroke", 'visibility', 'visible');
}

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
        return value.replace(/;/g,'; ');
    }

    function getValueSource(year, field) {
        // console.log(year, field, data.key);

        year = year+'';

        let filtered = sourcesData.filter(function(e){
            return e.id == data.key;
        })[0]
        // console.log(filtered)

        let source = filtered.sources.filter(function(e){
            return e.source_year == year
        })[0]
        // console.log(source)

        if (source) {
            return source[field]==''?'–':source[field];
        } else {
            return '–'
        }

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

    //Institution purposes as from sources
    thisTitle = 'Institution purposes as reported in source';
    furtherInformations += `
                <div class="row section-title">
                    <div class="col-3"></div>
                    <div class="col-9">${thisTitle}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1933<br/>Source of 1933</div>
                    <div class="col-9">${getValueSource(1933,'purpose')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1940ies<br/>Source of 1933</div>
                    <div class="col-9">
                        ${getValueSource('1940ies','purpose_source1933')}
                    </div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1940ies<br/>Source of 1944</div>
                    <div class="col-9">
                        ${getValueSource('1940ies','purpose_source1944')}
                    </div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1940ies<br/>Source of 1945</div>
                    <div class="col-9">
                        ${getValueSource('1940ies','purpose_source1945')}
                    </div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1954<br/>source one</div>
                    <div class="col-9">${getValueSource(1954,'purpose1')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1954<br/>source two</div>
                    <div class="col-9">${getValueSource(1954,'purpose2')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1965</div>
                    <div class="col-9">${getValueSource(1965,'purpose1')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1965<br/>source one</div>
                    <div class="col-9">${getValueSource(1965,'purpose2')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1980<br/>source one</div>
                    <div class="col-9">${getValueSource(1980,'purpose1')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1980<br/>source two</div>
                    <div class="col-9">${getValueSource(1980,'purpose2')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1980<br/>source three</div>
                    <div class="col-9">${getValueSource(1980,'purpose3')}</div>
                </div>`;

    //Institution purposes as from sources
    thisTitle = 'Institution categories as reported in source';
    furtherInformations += `
                <div class="row section-title">
                    <div class="col-3"></div>
                    <div class="col-9">${thisTitle}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1933<br/>Source of 1933</div>
                    <div class="col-9">${getValueSource(1933,'categories')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1940ies<br/>Source of ???</div>
                    <div class="col-9">
                        ${getValueSource('1940ies','categories')}
                    </div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1954<br/>source one</div>
                    <div class="col-9">${getValueSource(1954,'categories')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1954<br/>source two</div>
                    <div class="col-9">${getValueSource(1954,'categories')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1965</div>
                    <div class="col-9">${getValueSource(1965,'categories')}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1980<br/>source one</div>
                    <div class="col-9">${getValueSource(1980,'categories')}</div>
                </div>`;

    //Institution purposes as from sources
    thisTitle = 'Institution capacities as reported in source';
    furtherInformations += `
                <div class="row section-title">
                    <div class="col-3"></div>
                    <div class="col-9">${thisTitle}</div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1933<br/>Source of 1933</div>
                    <div class="col-9">${getValueSource(1933,'capacities')}</div>
                </div>

                <div class="row values">
                    <div class="col-3">Topography 1940ies<br/>Source of 1933</div>
                    <div class="col-9">
                        ${getValueSource('1940ies','capacities_source1933')}
                    </div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1940ies<br/>Source of 1939</div>
                    <div class="col-9">
                        ${getValueSource('1940ies','capacities_source1944')}
                    </div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1940ies<br/>Source of 1944</div>
                    <div class="col-9">
                        ${getValueSource('1940ies','capacities_source1944')}
                    </div>
                </div>
                <div class="row values">
                    <div class="col-3">Topography 1940ies<br/>Source of 1945</div>
                    <div class="col-9">
                        ${getValueSource('1940ies','capacities_source1945')}
                    </div>
                </div>

                <div class="row values">
                    <div class="col-3">Topography 1954<br/>source one</div>
                    <div class="col-9">${getValueSource(1954,'capacities')}</div>
                </div>

                <div class="row values">
                    <div class="col-3">Topography 1965</div>
                    <div class="col-9">${getValueSource(1965,'capacities')}</div>
                </div>

                <div class="row values">
                    <div class="col-3">Topography 1980<br/>source three</div>
                    <div class="col-9">${getValueSource(1980,'capacities')}</div>
                </div>`;

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

function reset(url) {
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
        if (map.getLayer("circular-area")) {
            map.setLayoutProperty("circular-area", 'visibility', 'none');
            map.setLayoutProperty("circular-area-stroke", 'visibility', 'none');
        }
    }

    if (url) {
        location.replace('#no-selection');
        // d3.event.preventDefault();
    }
}

d3.queue()
    .defer(d3.json, './../data_and_scripts/data/master.json')
    .defer(d3.json, './../data_and_scripts/data/sources-data.json')
    .await(function(err, data, data2) {
        if (err) throw err;
        // console.log(data);
        sourcesData = data2;

        data = d3.nest()
            .key(function(d) { return d.id })
            .key(function(d) { return d.survey_year })
            .entries(data);

        // console.log(data);

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
                if (d.values[0].values[0].opened_alternative) {
                    d.values[0].values[0].opened_alternative = '(' + d.values[0].values[0].opened_alternative + ')'
                }

                if (d.values[0].values[0].closed_alternative) {
                    d.values[0].values[0].closed_alternative = '(' + d.values[0].values[0].closed_alternative + ')'
                }


                let thisHtml = `
                    <div class="id field d-none">
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
                        <div class="value">${d.values[0].values[0].opened} ${d.values[0].values[0].opened_alternative}</div>
                    </div>
                    <div class="closing field">
                        <div class="label">Closed in (Alternative)</div>
                        <div class="value">${d.values[0].values[0].closed} ${d.values[0].values[0].closed_alternative}</div>
                    </div>
                    <div class="surveyes field">
                        <div class="label">Surveyes</div>
                        <div class="value"><span class="${fn(1933)}">1933</span><span class="${fn(1940)}">1940's</span><span class="${fn(1954)}">1954</span><span class="${fn(1965)}">1965</span><span class="${fn(1980)}">1980</span></div>
                    </div>
            `;
                return thisHtml;
            })
            .on('click', function(d) {
                handleSelection(d);
                location.replace(`#selected-${encodeURIComponent(d.key)}`);
                d3.event.preventDefault();
            })
            .merge(item);

        reset();

        d3.json('./../data_and_scripts/data/ch.json', function(err, ch) {
            if (err) throw err;
            // console.log(ch);
            mapboxgl.accessToken = 'pk.eyJ1IjoiaW9zb25vc2VtcHJlaW8iLCJhIjoiOHpYSnpLQSJ9.2ZxP5dSbQhs-dH0PhXER9A';
            map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
                center: [5.9814056, 46.7912769], // starting position [lng, lat]46.7912769,5.9814056
                zoom: 1 // starting zoom
            });



            console.log('read url data');

            map.on('load', function() {
                let swiss = topojson.feature(ch, ch.objects.country);
                swissbbox = topojson.bbox(ch, ch.objects.country);

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

                if (location.hash && location.hash != '#no-selection') {
                    console.log('there is something preselected:', location.hash.substring(10));

                    let thisSelection = data.filter(function(d) { return d.key == location.hash.substring(10) });
                    thisSelection = thisSelection[0]
                    handleSelection(thisSelection);

                    $('.list-container').animate({
                        scrollTop: $(`#${location.hash.substring(10)}`).offset().top - 132
                    }, 2000);

                }
            })

        })

    })



$(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
        reset(true);
    }
});

$(document).ready(function() {

});