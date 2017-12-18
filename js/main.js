let masterData;

let timeline,
    surviesSankey,
    surveySankeyMode = 'mosaic',
    bubblechart,
    typologiesGraph;

let map_all_institutions,
    map_typologies,
    matrix;

let circularNetwork,
    ciDirection = 'all', // could be all, into, from
    acceptingInstitutions,
    acceptingInstitutionsConfig = {
        'direction': 'from',
        'year': 1954
    }
    aiDirection = 'into';

$(document).ready(function() {

    d3.queue()
        .defer(d3.json, './data_and_scripts/data/master.json')
        .await(function(error, data) {
            if (error) throw error;
            masterData = data;

            // load asynchronously the datasets
            var dataFiles = ['./data_and_scripts/data/data-sankey-from-raw.json', './data_and_scripts/data/bubblechart.json', './data_and_scripts/data/typologies-graph.json'],
                queue = d3.queue();

            dataFiles.forEach(function(filename) {
                queue.defer(d3.json, filename);
            });

            queue.awaitAll(function(err, datasets) {
                if (err) {
                    console.error(err);
                }

                // timeline = new Timeline('#timeline');
                // timeline.draw();

                surviesSankey = new SurviesSankey('#sankey', datasets[0]);
                surviesSankey.draw(surveySankeyMode);

                bubblechart = new Bubblechart('#bubblechart', datasets[1]);
                bubblechart.draw();

                typologiesGraph = new TypologiesGraph('#typologies-graph', datasets[2]);
                typologiesGraph.draw();

                // To be called after all the charts have been initialized
                // call here the functions the initialize the waypoints for chapter 2, because it needs to calculate the space occupied by the viz in chapter 1
                $(document).trigger('setWaypoints');
            });

            // load asynchronously the datasets for chapter 2 and for chapter 4 (need map)
            d3.queue()
                .defer(d3.json, './data_and_scripts/data/ch.json')
                .defer(d3.json, './data_and_scripts/data/map_all_institutions.json')
                .defer(d3.json, './data_and_scripts/data/map_typologies.json')
                .defer(d3.json, './data_and_scripts/data/cantons-network.json')
                .await(function(error, swiss, data_all, data_typologies, cantonsNetwork) {
                    if (error) throw error;

                    map_all_institutions = new MapAll('#maps-visualization', swiss, data_all);
                    map_all_institutions.draw(1954);

                    map_typologies = new MapTypologies('#maps-visualization', swiss, data_typologies);

                    circularNetwork = new CircularNetwork('#circular-network', cantonsNetwork);
                    circularNetwork.draw();

                    acceptingInstitutions = new AcceptingInstitutions('#accepting-institutions', cantonsNetwork, swiss, acceptingInstitutionsConfig);
                    acceptingInstitutions.draw(acceptingInstitutionsConfig);
                });

            // load asynchronously the datasets for chapter 3
            d3.queue()
                .defer(d3.json, './data_and_scripts/data/matrix.json')
                .defer(d3.json, './data_and_scripts/data/matrix-categories.json')
                .await(function(error, data_matrix, categories) {
                    if (error) throw error;
                    matrix = new Matrix('#matrix-visualization', data_matrix, categories);
                    matrix.draw(1954);
                });
        });



    // change matrix selects when changing years
    let $matrixSelects = $('#matrix .select-container');

    $('#matrix label.btn-secondary').on('click', function() {
        let newYear = $(this).attr('data-id');

        $matrixSelects.each(function() {
            $(this).children('select').attr('onchange', 'matrix.draw(' + newYear + ')');
        })
    })

    // Add listener for window resize event, which triggers actions such as the resize of visualizations.
    function doneResizing() {

        // if (d3.select(timeline.id).node().offsetWidth - 30 != timeline.width) {
        //     timeline.draw();
        // }

        if (d3.select(surviesSankey.id).node().offsetWidth - 30 != surviesSankey.width) {
            surviesSankey.draw(surveySankeyMode);
        }

        if (d3.select(bubblechart.id).node().offsetWidth - 30 != bubblechart.width) {
            bubblechart.draw();
        }

        if (d3.select(typologiesGraph.id).node().offsetWidth - 30 != typologiesGraph.width) {
            typologiesGraph.draw();
        }

        if (d3.select(circularNetwork.id).node().offsetWidth - 30 != circularNetwork.width) {
            circularNetwork.draw();
        }

        if (d3.select(acceptingInstitutions.id).node().offsetWidth - 30 != acceptingInstitutions.width) {
            acceptingInstitutions.draw(acceptingInstitutionsConfig);
        }


    }

    let resizeId;
    window.addEventListener("resize", function() {
        clearTimeout(resizeId);
        resizeId = setTimeout(doneResizing, 500);
    });

});

$(document).on('setWaypoints', function() {
    // save the selection to a variable to improve performance
    let $mapButtons = $('#maps button'),
        years = [1933, 1940, 1954, 1965, 1980];

    // initiate waypoints
    // waypoint for typology map. call function to draw the typologies if going down, to draw total map if going up
    let typologies_waypoint = new Waypoint({
        element: document.getElementById('map-typology-text'),
        handler: function(direction) {
            if (direction == 'down') {
                // console.log('call map_typologies 1954');
                $mapButtons.each(function(i) {;
                    $(this).attr('onclick', 'map_typologies.draw(' + years[i] + ');closeSidepanel()');
                });
                map_typologies.draw(1954);
                switchButton(1954);
            } else {
                // console.log('call map_all_institutions 1954');
                $mapButtons.each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ');closeSidepanel()');
                });
                map_all_institutions.draw(1954);
                switchButton(1954);
            }
        },
        offset: '40%'
    });
    // waypoint for capacity map. call function to draw the capacities if going down, to draw typologies if going up
    let capacity_waypoint = new Waypoint({
        element: document.getElementById('map-capacity-text'),
        handler: function(direction) {
            if (direction == 'down') {
                // console.log('call map_capacities 1954');
                $mapButtons.each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "capacity_group");closeSidepanel()');
                });
                map_all_institutions.draw(1954, 'capacity_group');
                switchButton(1954);
            } else {
                // console.log('call map_typologies 1954');
                $mapButtons.each(function(i) {;
                    $(this).attr('onclick', 'map_typologies.draw(' + years[i] + ');closeSidepanel()');
                });
                map_typologies.draw(1954);
                switchButton(1954);
            }
        },
        offset: '40%'
    });
    // waypoint for confession map. call function to draw the confession if going down, to draw capacities if going up
    let confession_waypoint = new Waypoint({
        element: document.getElementById('map-confession-text'),
        handler: function(direction) {
            if (direction == 'down') {
                // console.log('call map_confession 1954');
                $mapButtons.each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "confession");closeSidepanel()');
                });
                map_all_institutions.draw(1954, 'confession');
                switchButton(1954);
            } else {
                // console.log('call map_capacities 1954');
                $mapButtons.each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "capacity_group");closeSidepanel()');
                });
                map_all_institutions.draw(1954, 'capacity_group');
                switchButton(1954);
            }
        },
        offset: '40%'
    });
    // waypoint for gender map. call function to draw the gender if going down, to draw confession if going up
    let gender_waypoint = new Waypoint({
        element: document.getElementById('map-gender-text'),
        handler: function(direction) {
            if (direction == 'down') {
                // console.log('call map_gender 1954');
                $mapButtons.each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "accepted_gender");closeSidepanel()');
                });
                map_all_institutions.draw(1954, 'accepted_gender');
                switchButton(1954);
            } else {
                // console.log('call map_confession 1954');
                $mapButtons.each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "confession");closeSidepanel()');
                });
                map_all_institutions.draw(1954, 'confession');
                switchButton(1954);
            }
        },
        offset: '40%'
    });

    $mapButtons.on('click', function(){
        $mapButtons.removeClass('active');
        $mapButtons.blur();
        $(this).addClass('active');
    })

    function switchButton(year) {
        $mapButtons.removeClass('active');
        $mapButtons.blur();
        $('#maps button[data-id=' + year + ']').addClass('active');
    }
});

function buildSidepanel(id, year) {
    let filters = {
        id: [id],
        survey_year: [year]
    }
    let filtered_institution = multiFilter(masterData, filters);

    d3.select('.sidepanel-container')
        .transition()
        .duration(300)
        .style('opacity', 1e-6)
        .remove();

    let panel = d3.select('.sidepanel')
        .append('div')
        .classed('sidepanel-container', true);

    panel.transition()
        .delay(300)
        .duration(300)
        .style('opacity', 1);

    panel.append('h6')
        .classed('sidepanel-data', true)
        .text(function(d){
            if (year != 1940) {
                return 'Survey of ' + year;
            } else {
                return 'Data from the 1940s';
            }
        });

    panel.append('h5')
        .classed('sidepanel-name', true)
        .text(filtered_institution[0].institution);

    panel.append('p')
        .text(filtered_institution[0].city + ' - ' + filtered_institution[0].canton_code);

    panel.append('p')
        .html('<strong>opened: </strong>' + filtered_institution[0].opened);

    panel.append('p')
        .html('<strong>closed: </strong>' + filtered_institution[0].closed);

    panel.append('p')
        .html('<strong>capacity: </strong>' + filtered_institution[0].capacity_group);

    panel.append('p')
        .html('<strong>accepted gender: </strong>' + filtered_institution[0].accepted_gender);

    panel.append('p')
        .html('<strong>confession: </strong>' + filtered_institution[0].confession);

    panel.append('p')
        .html('<strong>typology: </strong>' + filtered_institution[0].typologies);

    $('body').addClass('sidebar-open modal-open');
    $('.sidepanel').addClass('sidepanel-open');
}

function closeSidepanel() {
    d3.select('.sidepanel-container')
        .transition()
        .duration(300)
        .style('opacity', 1e-6)
        .remove();

    $('body').removeClass('sidebar-open modal-open');
    $('.sidepanel').removeClass('sidepanel-open');
}

function multiFilter(array, filters) {
  const filterKeys = Object.keys(filters);
  // filters all elements passing the criteria
  return array.filter((item) => {
    // dynamically validate all filter criteria
    return filterKeys.every(key => !!~filters[key].indexOf(item[key]));
  });
}
