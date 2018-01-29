let masterData,
    timelinetimelineData;

let surviesSankey,
    surveySankeyMode = 'mosaic',
    bubblechart,
    typologiesGraph;

let years = [1933, 1940, 1954, 1965, 1980],
    yearsAlternative = [1900, 1933, 1940, 1954, 1965, 1980],
    containerMapsWidth,
    containerBubblechartWidth,
    containerTypologiesWidth,
    containerMatrixWidth,
    containerCircularWidth,
    containerAcceptingWidth,
    buttonWidth,
    bubblechartSpacer,
    typologiesSpacer,
    mapsSpacer,
    matrixSpacer,
    map_all_institutions,
    map_typologies,
    currentMapsCategory,
    matrix;

let circularNetwork,
    ciDirection = 'all', // could be all, into, from
    acceptingInstitutions,
    acceptingInstitutionsConfig = {
        'direction': 'into',
        'year': 1954
    }
    aiDirection = 'into';

$(document).ready(function() {

    d3.queue()
        .defer(d3.json, './data_and_scripts/data/master.json')
        .defer(d3.json, './data_and_scripts/data/timeline.json')
        .await(function(error, data, dataTimeline) {
            if (error) throw error;
            masterData = data;
            timelineData = dataTimeline;

            // load asynchronously the datasets
            var dataFiles = ['./data_and_scripts/data/sankey-institutions-with-list.json', './data_and_scripts/data/bubblechart.json', './data_and_scripts/data/typologies-graph.json'],
                queue = d3.queue();

            dataFiles.forEach(function(filename) {
                queue.defer(d3.json, filename);
            });

            queue.awaitAll(function(err, datasets) {
                if (err) {
                    console.error(err);
                }

                surviesSankey = new SurviesSankey('#sankey', datasets[0]);
                surviesSankey.draw(surveySankeyMode);

                bubblechart = new Bubblechart('#bubblechart', datasets[1]);
                bubblechart.draw();

                typologiesGraph = new TypologiesGraph('#typologies-graph', datasets[2]);
                typologiesGraph.draw(1954);

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
                    map_all_institutions.draw(1900);

                    map_typologies = new MapTypologies('#maps-visualization', swiss, data_typologies);

                    circularNetwork = new CircularNetwork('#circular-network', cantonsNetwork);
                    circularNetwork.draw(1954, 'FR');

                    acceptingInstitutions = new AcceptingInstitutions('#accepting-institutions', cantonsNetwork, swiss, acceptingInstitutionsConfig);
                    acceptingInstitutions.draw(acceptingInstitutionsConfig, 'FR');

                    $(document).trigger('setNavigation');
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

    // add scroll events to navigation sidebar
    $("#navigation-sidebar .nav-link").on('click', function(e) {
        // prevent default anchor click behavior
        e.preventDefault();
        // store hash
        let hash = this.hash;
        // animate
        $('html, body').animate({
           scrollTop: $(hash).offset().top
        }, 500, function(){
           // when done, add hash to url
           // (default click behaviour)
           window.location.hash = hash;
        });

    });

    // set waypoints for timeline
    // highlight social if going down, hide if going up
    let social_waypoint = new Waypoint({
        element: document.getElementById('timeline-text-soc'),
        handler: function(direction) {
            if (direction == 'down') {
                $('.timeline-dots').addClass('element-grayed');
                $('.dots-soc').removeClass('element-grayed');
                $('#texts .timeline-legend').addClass('element-grayed');
                $('.timeline-legend-soc').removeClass('element-grayed');
                $('.timeline-text').removeClass('text-highlighted');
                $('#timeline-text-soc').addClass('text-highlighted');
            } else {
                $('.timeline-dots').removeClass('element-grayed');
                $('#texts .timeline-legend').removeClass('element-grayed');
                $('.timeline-text').removeClass('text-highlighted');
            }
        },
        offset: '70%'
    });

    let legislative_waypoint = new Waypoint({
        element: document.getElementById('timeline-text-leg'),
        handler: function(direction) {
            if (direction == 'down') {
                $('.timeline-dots').addClass('element-grayed');
                $('.dots-leg').removeClass('element-grayed');
                $('#texts .timeline-legend').addClass('element-grayed');
                $('.timeline-legend-leg').removeClass('element-grayed');
                $('.timeline-text').removeClass('text-highlighted');
                $('#timeline-text-leg').addClass('text-highlighted');
            } else {
                $('.timeline-dots').addClass('element-grayed');
                $('.dots-soc').removeClass('element-grayed');
                $('#texts .timeline-legend').addClass('element-grayed');
                $('.timeline-legend-soc').removeClass('element-grayed');
                $('.timeline-text').removeClass('text-highlighted');
                $('#timeline-text-soc').addClass('text-highlighted');
            }
        },
        offset: '65%'
    });

    let detention_waypoint = new Waypoint({
        element: document.getElementById('timeline-text-det'),
        handler: function(direction) {
            if (direction == 'down') {
                $('.timeline-dots').addClass('element-grayed');
                $('.dots-det').removeClass('element-grayed');
                $('#texts .timeline-legend').addClass('element-grayed');
                $('.timeline-legend-det').removeClass('element-grayed');
                $('.timeline-text').removeClass('text-highlighted');
                $('#timeline-text-det').addClass('text-highlighted');
            } else {
                $('.timeline-dots').addClass('element-grayed');
                $('.dots-leg').removeClass('element-grayed');
                $('#texts .timeline-legend').addClass('element-grayed');
                $('.timeline-legend-leg').removeClass('element-grayed');
                $('.timeline-text').removeClass('text-highlighted');
                $('#timeline-text-leg').addClass('text-highlighted');
            }
        },
        offset: '70%'
    });
    // set events for timeline
    $('.dots-det').click(function(){
        let dotId = $(this).attr('data-id');
        buildSidepanel(dotId, 1900);
    })
    $('.dots-leg').click(function(){
        let elementYear = $(this).attr('data-id');
        buildTimelineSidepanel('law', elementYear);
    })
    $('.dots-soc').click(function(){
        let elementYear = $(this).attr('data-id');
        buildTimelineSidepanel('events', elementYear);
    })

    // change matrix selects when changing years, setup matrix buttons
    let $matrixButtons = $('#matrix .btn-matrix-year'),
        $matrixSelects = $('#matrix .select-container'),
        subchapterWidth = $('#temporal-framing').width();

    containerBubblechartWidth = $('#bubblechart .btn-container').width();
    containerTypologiesWidth = $('#typologies-graph .btn-container').width();
    containerMatrixWidth = $('#matrix .btn-container').width();
    containerCircularWidth = $('#circular-network .btn-container').width();
    containerAcceptingWidth = $('#accepting-institutions .btn-container').width();
    buttonWidth = $('.btn-typologies-year').width();

    if (subchapterWidth > 960) {
        matrixSpacer = 8;
        bubblechartSpacer = 7;
        typologiesSpacer = 7;
    } else if (subchapterWidth > 720) {
        matrixSpacer = 12;
        bubblechartSpacer = 10;
        typologiesSpacer = 14;
    } else {
        matrixSpacer = 30;
        bubblechartSpacer = 20;
        typologiesSpacer = 400;
    }

    //set up initial active buttons
    changeButton(1954, containerBubblechartWidth, '.btn-bubblechart-year', bubblechartSpacer);
    changeButton(1954, containerTypologiesWidth, '.btn-typologies-year', typologiesSpacer);
    changeButton(1954, containerMatrixWidth, '.btn-matrix-year', matrixSpacer);
    changeButton(1954, containerCircularWidth, '.btn-circular-year', 8);
    changeButton(1954, containerAcceptingWidth, '.btn-accepting-year', 8);

    $('.btn-bubblechart-year').on('click', function() {
        let newYear = $(this).attr('data-id');

        changeButton(newYear, containerBubblechartWidth, '.btn-bubblechart-year', bubblechartSpacer);
    });

    $('.btn-typologies-year').on('click', function() {
        let newYear = $(this).attr('data-id');

        changeButton(newYear, containerTypologiesWidth, '.btn-typologies-year', typologiesSpacer);
    });

    $matrixButtons.on('click', function() {
        let newYear = $(this).attr('data-id');

        $matrixSelects.each(function() {
            $(this).children('select').attr('onchange', 'matrix.draw(' + newYear + ')');
        });

        changeButton(newYear, containerMatrixWidth, '.btn-matrix-year', matrixSpacer);
    });

    $('.btn-circular-year').on('click', function() {
        let newYear = $(this).attr('data-id');

        changeButton(newYear, containerCircularWidth, '.btn-circular-year', 8);
    });

    $('.btn-accepting-year').on('click', function() {
        let newYear = $(this).attr('data-id');

        changeButton(newYear, containerAcceptingWidth, '.btn-accepting-year', 8);
    });

    // Add listener for window resize event, which triggers actions such as the resize of visualizations.
    function doneResizing() {

        // if (d3.select(timeline.id).node().offsetWidth - 30 != timeline.width) {
        //     timeline.draw();
        // }

        if (d3.select(surviesSankey.id).node().offsetWidth - 30 != surviesSankey.width) {

            let bubblechartYearState = $('#bubblechart .active-year').attr('data-id'),
                typologiesYearState = $('#typologies-graph .active-year').attr('data-id'),
                mapYearState = $('#maps .btn-year.active-year').attr('data-id'),
                matrixYearState = $('#matrix .active-year').attr('data-id'),
                circularYearState = $('#circular-network .active-year').attr('data-id'),
                acceptingYearState = $('#accepting-institutions .active-year').attr('data-id');

            acceptingInstitutionsConfig.year = acceptingYearState;

            surviesSankey.draw(surveySankeyMode);
            bubblechart.draw(bubblechartYearState);
            typologiesGraph.draw(typologiesYearState);

            let mapState = $('#maps-visualization .map-container').attr('data-category');
            if (mapState == 'hidden') {
                map_typologies.draw(mapYearState);
            } else if (mapState == 'typology') {
                map_all_institutions.draw(mapYearState);
            } else {
                map_all_institutions.draw(mapYearState, mapState);
            }

            matrix.draw(matrixYearState);
            circularNetwork.draw(circularYearState);
            acceptingInstitutions.draw(acceptingInstitutionsConfig);

            //re-calc all the widths for the year buttons
            containerBubblechartWidth = $('#bubblechart .btn-container').width();
            containerTypologiesWidth = $('#typologies-graph .btn-container').width();
            containerMapsWidth = $('#maps .btn-container').width();
            containerMatrixWidth = $('#matrix .btn-container').width();
            containerCircularWidth = $('#circular-network .btn-container').width();
            containerAcceptingWidth = $('#accepting-institutions .btn-container').width();

            let subchapterWidth = $('#temporal-framing').width();
            if (subchapterWidth > 960) {
                mapsSpacer = 7;
                matrixSpacer = 8;
                bubblechartSpacer = 7;
                typologiesSpacer = 7;
            } else if (subchapterWidth > 720) {
                mapsSpacer = 14;
                matrixSpacer = 12;
                bubblechartSpacer = 10;
                typologiesSpacer = 14;
            } else {
                mapsSpacer = 20;
                matrixSpacer = 30;
                bubblechartSpacer = 20;
                typologiesSpacer = 400;
            }

            changeButton(bubblechartYearState, containerBubblechartWidth, '.btn-bubblechart-year', bubblechartSpacer);
            changeButton(typologiesYearState, containerTypologiesWidth, '.btn-typologies-year', typologiesSpacer);
            changeButton(mapYearState, containerMapsWidth, '.btn-maps-year', mapsSpacer);
            changeButton(matrixYearState, containerMatrixWidth, '.btn-matrix-year', matrixSpacer);
            changeButton(circularYearState, containerCircularWidth, '.btn-circular-year', 8);
            changeButton(acceptingYearState, containerAcceptingWidth, '.btn-accepting-year', 8);
        }

        // if (d3.select(bubblechart.id).node().offsetWidth - 30 != bubblechart.width) {
        //     bubblechart.draw();
        // }
        //
        // if (d3.select(typologiesGraph.id).node().offsetWidth - 30 != typologiesGraph.width) {
        //     typologiesGraph.draw();
        // }
        //
        // let mapState = $('#maps-visualization .map-container').attr('data-category');
        // let yearState = $('#maps .btn-year.active-year').attr('data-id');
        // if (mapState == 'hidden') {
        //     map_typologies.draw(yearState);
        // } else if (mapState == 'typology') {
        //     map_all_institutions.draw(yearState);
        // } else {
        //     map_all_institutions.draw(yearState, mapState);
        // }
        //
        // if (d3.select(circularNetwork.id).node().offsetWidth - 30 != circularNetwork.width) {
        //     circularNetwork.draw();
        // }
        //
        // if (d3.select(acceptingInstitutions.id).node().offsetWidth - 30 != acceptingInstitutions.width) {
        //     acceptingInstitutions.draw(acceptingInstitutionsConfig);
        // }


    }

    let resizeId;
    window.addEventListener("resize", function() {
        clearTimeout(resizeId);
        resizeId = setTimeout(doneResizing, 500);
    });

});

$(document).on('setWaypoints', function() {
    //calculate container and button width
    containerMapsWidth = $('#maps .btn-container').width();
    buttonWidth = $('.btn-maps-year[data-id=1940]').width();
    let subchapterWidth = $('#temporal-framing').width();
    if (subchapterWidth > 960) {
        mapsSpacer = 7;
    } else if (subchapterWidth > 720) {
        mapsSpacer = 14;
    } else {
        mapsSpacer = 20;
    }

    // save the selection to a variable to improve performance
    // let $mapButtons = $('#maps .btn-maps-year');

    //set up initial active map button
    changeButton(1900, containerMapsWidth, '.btn-maps-year', mapsSpacer);

    // initiate waypoints
    // waypoint for sankey/mosaic. call function sankey if going down, mosaic if going up
    let sankey_waypoint = new Waypoint({
        element: document.getElementById('sankey-text'),
        handler: function(direction) {
            if (direction == 'down') {
                surveySankeyMode = 'sankey';
                surviesSankey.draw(surveySankeyMode);
            } else {
                surveySankeyMode = 'mosaic';
                surviesSankey.draw(surveySankeyMode);
            }
        },
        offset: '40%'
    });
    // waypoint for typology map. call function to draw the typologies if going down, to draw total map if going up
    let typologies_waypoint = new Waypoint({
        element: document.getElementById('map-typology-text'),
        handler: function(direction) {
            if (direction == 'down') {
                // console.log('call map_typologies 1954');
                $('.year-all').fadeOut(function(){
                    $(this).remove();
                    $('#maps .btn-maps-year').each(function(i) {
                        $(this).attr('onclick', 'map_typologies.draw(' + years[i] + ');closeSidepanel()');
                        changeButton(1965, containerMapsWidth, '.btn-maps-year', mapsSpacer);
                    });
                })
                map_typologies.draw(1965);

            } else {
                // console.log('call map_all_institutions 1954');
                $('#maps .btn-container').prepend(`<span class="btn-year btn-maps-year year-all" onclick="map_all_institutions.draw(1900);closeSidepanel()" data-id="1900">All</span>`).fadeIn(function(){
                    $('#maps .btn-maps-year').each(function(i, btn) {
                        $(this).attr('onclick', 'map_all_institutions.draw(' + yearsAlternative[i] + ');closeSidepanel()');
                    });
                    changeButton(1900, containerMapsWidth, '.btn-maps-year', mapsSpacer);
                });
                map_all_institutions.draw(1900);
                $('.year-all').on('click', function(){
                    let newYear = $(this).attr('data-id');
                    changeButton(newYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
                });
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
                $('#maps .btn-maps-year').each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "capacity_group");closeSidepanel()');
                });
                map_all_institutions.draw(1954, 'capacity_group');
                changeButton(1954, containerMapsWidth, '.btn-maps-year', mapsSpacer);
            } else {
                // console.log('call map_typologies 1954');
                $('#maps .btn-maps-year').each(function(i) {;
                    $(this).attr('onclick', 'map_typologies.draw(' + years[i] + ');closeSidepanel()');
                });
                map_typologies.draw(1965);
                changeButton(1965, containerMapsWidth, '.btn-maps-year', mapsSpacer);
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
                $('#maps .btn-maps-year').each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "confession");closeSidepanel()');
                });
                map_all_institutions.draw(1965, 'confession');
                changeButton(1965, containerMapsWidth, '.btn-maps-year', mapsSpacer);
            } else {
                // console.log('call map_capacities 1954');
                $('#maps .btn-maps-year').each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "capacity_group");closeSidepanel()');
                });
                map_all_institutions.draw(1954, 'capacity_group');
                changeButton(1954, containerMapsWidth, '.btn-maps-year', mapsSpacer);
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
                $('#maps .btn-maps-year').each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "accepted_gender");closeSidepanel()');
                });
                map_all_institutions.draw(1965, 'accepted_gender');
                changeButton(1965, containerMapsWidth, '.btn-maps-year', mapsSpacer);
            } else {
                // console.log('call map_confession 1954');
                $('#maps .btn-maps-year').each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "confession");closeSidepanel()');
                });
                map_all_institutions.draw(1965, 'confession');
                changeButton(1965, containerMapsWidth, '.btn-maps-year', mapsSpacer);
            }
        },
        offset: '40%'
    });

    $('#maps .btn-maps-year').on('click', function(){
        let newYear = $(this).attr('data-id');
        changeButton(newYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
    });

    $('.year-switch').on('click', function(){
        let newYear = $(this).attr('data-id');
        changeButton(newYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
    })

});

function changeButton(year, width, buttons, spacer) {
    $(buttons).removeClass('active-year');
    $(buttons + '[data-id='+ year +']').addClass('active-year');
    let indexButton = $(buttons).index($(buttons + '.active-year'));
    $(buttons).each(function(i){
        if (i == indexButton) {
            $(this).css('left', width / 2);
            if ($(buttons).length == 6 && buttons == '.btn-maps-year' && spacer == 20) {
                $(this).css('top', 25);
            } else {
                $(this).css('top', 0);
            }
        } else if (i < indexButton) {
            $(this).css('left', 15 + (15 + buttonWidth) * i + width / spacer);
            $(this).css('top', 0);
        } else {
            $(this).css('left', width - 15 - (15 + buttonWidth) * ($(buttons).length - i - 1) - width / spacer);
            $(this).css('top', 0);
        }
    })
}

function buildSidepanel(id, year) {
    let filters;
    if (id.substring(0,2) == 'XX') {

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
            .text('Unspecified survey');

        panel.append('h5')
            .classed('sidepanel-name', true)
            .text('Other');

        panel.append('p')
            .text('There is not enough information about the institution.');

    } else {
        if (year == 1900) {
            filters = {
                id: [id]
            }
        } else {
            filters = {
                id: [id],
                survey_year: [year]
            }
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
                if (year != 1940 && year != 1900) {
                    return 'Survey of ' + year;
                } else if (year == 1900) {
                    return 'Unspecified survey';
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

        panel.append('div')
            .classed('sidepanel-button', true)
            .append('a')
            .attr('href', function(d){
                return './glossary/#selected-' + filtered_institution[0].id;
            })
            .attr('target', '_blank')
            .text('Get more details');
    }

    $('body').addClass('sidebar-open modal-open');
    $('.sidepanel').addClass('sidepanel-open');
}

function buildSidepanelList(list) {

    let filtered_institution = [];
    list.forEach(function(id){
        let match = masterData.find(function(element) {
            return element.id == id;
        });
        filtered_institution.push(match);
    })
    // console.log(filtered_institution);

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

    panel.append('h5')
        .classed('sidepanel-support-title', true)
        .text('Click on an institution to get more details:');

    let institutionList = panel.selectAll('.institution-list')
        .data(filtered_institution, function(d){
            return d.id;
        });

    institutionList.exit()
        .transition()
        .duration(300)
        .style('opacity', 1e-6)
        .remove();

    institutionList.enter()
        .append('p')
        .classed('sidepanel-list-item', true)
        .append('a')
        .style('opacity', 1e-6)
        .attr('target', '_blank')
        .merge(institutionList)
        .text(function(d){
            return d.id + ' - ' + d.institution;
        })
        .attr('href',function(d){
            return './glossary/#selected-' + d.id;
        })
        .transition()
        .duration(500)
        .style('opacity', 1);

    $('body').addClass('sidebar-open modal-open');
    $('.sidepanel').addClass('sidepanel-open');
}

function buildTimelineSidepanel(type, year) {
    let filters= {
            type: [type],
            date: [year]
        };
    let filtered_institution = multiFilter(timelineData, filters);

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
            if (type == 'events') {
                return filtered_institution[0].date;
            } else {
                let date = filtered_institution[0].date.match(/\d+/g);
                return date;
            }
        });

    panel.append('h5')
        .classed('sidepanel-name', true)
        .style('text-transform', 'capitalize')
        .text(filtered_institution[0].type);

    panel.append('p')
        .text(filtered_institution[0].text);

    if (filtered_institution[0].link != null) {
        panel.append('p')
            .append('a')
            .attr('href', filtered_institution[0].link)
            .attr('target', '_blank')
            .text('Link to source');
    }

    $('body').addClass('sidebar-open modal-open');
    $('.sidepanel').addClass('sidepanel-open');
}

function changeMatrixStatus(valY, valX) {
    $('#scatterplot-y').val(valY).change();
    $('#scatterplot-x').val(valX).change();
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
