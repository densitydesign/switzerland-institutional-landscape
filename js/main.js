let loadingSize;

let masterData,
    timelinetimelineData;

let surviesSankey,
    surveySankeyMode = 'mosaic',
    bubblechart;

// let typologiesGraph;

let years = [1933, 1940, 1954, 1965, 1980],
    yearsAlternative = [1900, 1933, 1940, 1954, 1965, 1980],
    mapStep = 'total',
    containerMapsWidth,
    containerBubblechartWidth,
    containerTypologiesWidth,
    containerMatrixWidth,
    containerCircularWidth,
    containerAcceptingWidth,
    containerAcceptingDirectionWidth,
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
    },
    aiDirection = 'into';

const timelineScroller = scrollama();
const sankeyScroller = scrollama();
const mapScroller = scrollama();

$(document).ready(function() {

    loadingSize = $(window).width();

    if (loadingSize > 767) {
        d3.queue()
            .defer(d3.json, './data_and_scripts/data/master.json')
            .defer(d3.json, './data_and_scripts/data/timeline.json')
            .await(function(error, data, dataTimeline) {
                if (error) throw error;
                masterData = data;
                timelineData = dataTimeline;

                // load asynchronously the datasets
                var dataFiles = ['./data_and_scripts/data/sankey-institutions-with-list.json', './data_and_scripts/data/bubblechart.json'],
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

                    // typologiesGraph = new TypologiesGraph('#typologies-graph', datasets[2]);
                    // typologiesGraph.draw(1954);

                    // To be called after all the charts have been initialized
                    // call here the functions the initialize scrollama for chapter 2, because it needs to calculate the space occupied by the viz in chapter 1
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
            }, 500, function() {
                // when done, add hash to url
                // (default click behaviour)
                window.location.hash = hash;
            });

        });
    } else {
        d3.select('.initial-loader').classed('content-loaded', true)
            .transition()
            .duration(1000)
            .delay(1000)
            .style('opacity', 1e-6)
            .on('end', function(d) {
                d3.select('.initial-loader').remove();
            });
    }

    // set scrollama for timeline
    let timelineOffset = ($('#timeline').outerHeight() + 60) / window.innerHeight;

    timelineScroller.setup({
            step: '.timeline-text',
            offset: timelineOffset
        })
        .onStepEnter(updateTimeline)
        .onStepExit(resetTimeline);

    // add year buttons only when screen is big enough
    if (loadingSize > 767) {
        // set events for timeline
        $('.dots-det').click(function() {
            let dotId = $(this).attr('data-id');
            buildSidepanel(dotId, 1900);
        })
        $('.dots-leg').click(function() {
            let elementYear = $(this).attr('data-id');
            buildTimelineSidepanel('legal text', elementYear);
        })
        $('.dots-soc').click(function() {
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
        containerAcceptingDirectionWidth = $('#accepting-institutions .btn-container-direction').width();
        buttonWidth = $('.btn-bubblechart-year[data-id=1940]').width();

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
        changeButton('into', containerAcceptingDirectionWidth, '.btn-direction', 8);

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

        $('.btn-direction').on('click', function() {
            let newDirection = $(this).attr('data-id');

            changeButton(newDirection, containerAcceptingDirectionWidth, '.btn-direction', 8);
        });
    }

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
                acceptingYearState = $('#accepting-institutions .btn-container .active-year').attr('data-id');
                acceptingDirectionState = $('#accepting-institutions .btn-container-direction .active-year').attr('data-id');

            acceptingInstitutionsConfig.year = acceptingYearState;
            acceptingInstitutionsConfig.direction = acceptingDirectionState;

            surviesSankey.draw(surveySankeyMode);
            bubblechart.draw(bubblechartYearState);
            // typologiesGraph.draw(typologiesYearState);

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
            containerAcceptingDirectionWidth = $('#accepting-institutions .btn-container-direction').width();

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
            changeButton(acceptingDirectionState, containerAcceptingDirectionWidth, '.btn-direction', 8);

            timelineScroller.resize();
            sankeyScroller.resize();
            mapScroller.resize();
            navScroller.resize();
        }

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

    //set up initial active map button
    changeButton(1900, containerMapsWidth, '.btn-maps-year', mapsSpacer);

    // initiate scrollama
    // waypoint for sankey/mosaic. call function sankey if going down, mosaic if going up
    sankeyScroller.setup({
            step: '#sankey-text',
            offset: 0.4
        })
        .onStepEnter(updateSankey)
        .onStepExit(resetSankey);

    // waypoint for typology map
    mapScroller.setup({
            step: '.step',
            offset: 0.4
        })
        .onStepEnter(updateMap);


    $('#maps .btn-maps-year').on('click', function() {
        let newYear = $(this).attr('data-id');
        changeButton(newYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
    });

    $('.year-switch').on('click', function() {
        let newYear = $(this).attr('data-id');
        changeButton(newYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
    });

});

function changeButton(year, width, buttons, spacer) {
    $(buttons).removeClass('active-year');
    $(buttons + '[data-id=' + year + ']').addClass('active-year');
    let indexButton = $(buttons).index($(buttons + '.active-year'));
    $(buttons).each(function(i) {
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
    if (id.substring(0, 2) == 'XX') {

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
            .text(function(d) {
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
            .classed('institution-subtitle', true)
            .text(filtered_institution[0].city + ' - ' + filtered_institution[0].canton_code);

        panel.append('p')
            .html('<span class="section-title">opened</span></br>' + filtered_institution[0].opened);

        panel.append('p')
            .html('<span class="section-title">closed</span></br>' + filtered_institution[0].closed);

        panel.append('p')
            .html('<span class="section-title">capacity</span></br>' + filtered_institution[0].capacity_group);

        panel.append('p')
            .html('<span class="section-title">accepted gender</span></br>' + filtered_institution[0].accepted_gender);

        panel.append('p')
            .html('<span class="section-title">confession</span></br>' + filtered_institution[0].confession);

        panel.append('p')
            .html('<span class="section-title">typology</span></br>' + filtered_institution[0].typologies.replace(/;/g, '; '));

        panel.append('div')
            .classed('sidepanel-button', true)
            .append('a')
            .attr('href', function(d) {
                return './glossaries/institutions-glossary.html#selected-' + filtered_institution[0].id;
            })
            .attr('target', '_blank')
            .text('Get more details');
    }

    $('body').addClass('sidebar-open modal-open');
    $('.sidepanel').addClass('sidepanel-open');
    $('[data-toggle="tooltip"]').tooltip('disable');
}

function buildSidepanelList(list) {

    let filtered_institution = [];
    list.forEach(function(id) {
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
        .data(filtered_institution, function(d) {
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
        .text(function(d) {
            return d.id + ' - ' + d.institution;
        })
        .attr('href', function(d) {
            return './glossaries/institutions-glossary.html#selected-' + d.id;
        })
        .transition()
        .duration(500)
        .style('opacity', 1);

    $('body').addClass('sidebar-open modal-open');
    $('.sidepanel').addClass('sidepanel-open');
}

function buildTimelineSidepanel(type, year) {
    let filters = {
        type: [type],
        date: [year]
    };
    let filtered_element = multiFilter(timelineData, filters);

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
        .text(function(d) {
            if (type == 'events') {
                return filtered_element[0].date;
            } else {
                let date = filtered_element[0].date.match(/\d+/g);
                return date;
            }
        });

    panel.append('h5')
        .classed('sidepanel-name', true)
        .style('text-transform', 'capitalize')
        .text(function(d) {
            if (filtered_element[0].title == null) {
                return filtered_element[0].type;
            } else {
                return filtered_element[0].title;
            }
        });

    panel.append('p')
        .text(filtered_element[0].text);

    if (filtered_element[0].link != null) {
        panel.append('p')
            .append('a')
            .attr('href', filtered_element[0].link)
            .attr('target', '_blank')
            .text('Link to source');
    }

    if (type == 'legal text' && filtered_element[0].id != null) {
        panel.append('div')
            .classed('sidepanel-button', true)
            .append('a')
            .attr('href', function(d) {
                return './glossaries/laws-glossary.html#selected-' + encodeURIComponent(filtered_element[0].id);
            })
            .attr('target', '_blank')
            .text('Get more details');
    }

    $('body').addClass('sidebar-open modal-open');
    $('.sidepanel').addClass('sidepanel-open');
    $('[data-toggle="tooltip"]').tooltip('disable');
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
    $('[data-toggle="tooltip"]').tooltip('enable');
}

function multiFilter(array, filters) {
    const filterKeys = Object.keys(filters);
    // filters all elements passing the criteria
    return array.filter((item) => {
        // dynamically validate all filter criteria
        return filterKeys.every(key => !!~filters[key].indexOf(item[key]));
    });
}

function updateTimeline(step) {
    let currentEl = $('.timeline-text[data-scrollama-index="' + step.index + '"]').attr('data-step-type');

    $('.timeline-dots').addClass('element-grayed');
    $('.dots-' + currentEl).removeClass('element-grayed');
    $('#texts .timeline-legend').addClass('element-grayed');
    $('.timeline-legend-' + currentEl).removeClass('element-grayed');
    $('.timeline-text').removeClass('text-highlighted');
    $('#timeline-text-' + currentEl).addClass('text-highlighted');
}

function resetTimeline(step) {
    if ((step.index == 0 && step.direction == 'up') || (step.index == 2 && step.direction == 'down')) {
        $('.timeline-dots').removeClass('element-grayed');
        $('#texts .timeline-legend').removeClass('element-grayed');
        $('.timeline-text').removeClass('text-highlighted');
    }
}

function updateSankey(step) {
    if (step.direction == 'down') {
        surveySankeyMode = 'sankey';
        surviesSankey.draw(surveySankeyMode);
    }
}

function resetSankey(step) {
    if (step.direction == 'up') {
        surveySankeyMode = 'mosaic';
        surviesSankey.draw(surveySankeyMode);
    }
}

function updateMap(step) {
    let currentEl = $('.step[data-scrollama-index="' + step.index + '"]').attr('data-step-type');

    if (currentEl != mapStep) {
        let newMapYear = (currentEl == 'total') ? 1900 : (currentEl == 'capacity_group') ? 1954 : 1965;

        if (currentEl == 'total') {
            $('#maps .btn-container').prepend(`<span class="btn-year btn-maps-year year-all" onclick="map_all_institutions.draw(` + newMapYear + `);closeSidepanel()" data-id="` + newMapYear + `">All</span>`).fadeIn(function() {
                $('#maps .btn-maps-year').each(function(i, btn) {
                    $(this).attr('onclick', 'map_all_institutions.draw(' + yearsAlternative[i] + ');closeSidepanel()');
                });
                changeButton(newMapYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
            });
            map_all_institutions.draw(newMapYear);
            $('.year-all').on('click', function() {
                let newYear = $(this).attr('data-id');
                changeButton(newYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
            });
        } else if (currentEl == 'typology') {
            if (step.direction == 'down') {
                $('.year-all').fadeOut(function() {
                    $(this).remove();
                    $('#maps .btn-maps-year').each(function(i) {
                        $(this).attr('onclick', 'map_typologies.draw(' + years[i] + ');closeSidepanel()');
                        changeButton(newMapYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
                    });
                })
                map_typologies.draw(newMapYear);
            } else {
                $('#maps .btn-maps-year').each(function(i) {;
                    $(this).attr('onclick', 'map_typologies.draw(' + years[i] + ');closeSidepanel()');
                });
                map_typologies.draw(newMapYear);
                changeButton(newMapYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
            }
        } else {
            $('#maps .btn-maps-year').each(function(i, btn) {
                $(this).attr('onclick', 'map_all_institutions.draw(' + years[i] + ', "' + currentEl + '");closeSidepanel()');
            });
            map_all_institutions.draw(newMapYear, currentEl);
            changeButton(newMapYear, containerMapsWidth, '.btn-maps-year', mapsSpacer);
        }
        mapStep = currentEl;
    }
}
