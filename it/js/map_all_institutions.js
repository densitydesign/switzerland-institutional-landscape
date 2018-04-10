function MapAll(id, swiss, data) {

    this.id = id;
    console.log(data);

    if (data) {
        this.data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        // console.log(this.data);
        // console.log(swiss);
        this.allData = d3.nest()
            .key(function(d) { return d.id; })
            .entries(data);
        // console.log(this.allData);
    }
    //define elements that will be present in the visualization
    let svg,
        mapGroup,
        swissBorderContainer,
        cantonsBorderContainer,
        dotGroup,
        legendGroup,
        node,
        item;

    //define dimensions of the container
    let width,
        height,
        radius;

    // define projection and path-generator variables
    let projection = d3.geoMercator(),
        path = d3.geoPath().projection(projection);

    // transform topojson to geojson
    let swissOutline = topojson.feature(swiss, swiss.objects.country),
        cantons = topojson.feature(swiss, swiss.objects.cantons),
        oldCantons = topojson.feature(swiss, swiss.objects.cantons),
        union = turf.union(oldCantons.features[1], oldCantons.features[25]);

    oldCantons.features[1] = union;
    oldCantons.features.pop();

    // define forces
    let simulation = d3.forceSimulation()
        .on("tick", ticked);

    // define color scales, with ranges and domains
    let categoriesList = {
        'capacity_group': ["0 - 19", "20 - 49", "50 - 99", "100 - 149", "150 - 199", "200 o più", "non indicato"],
        'confession': ["protestante", "cattolica", "interconfessionale", "non indicato"],
        'accepted_gender': ["maschile", "femminile", "misto", "non indicato"]
    }
    let capacityScale = d3.scaleOrdinal()
        .domain(categoriesList['capacity_group'])
        .range(['#DCC274', '#CFB76D', '#B5A060', '#8F7F4B', '#4F462A', '#38321E', '#FFFFFF']);
    let confessionScale = d3.scaleOrdinal()
        .domain(categoriesList['confession'])
        .range(['#E95B59', '#7FA3B4', '#CFB76D', '#FFFFFF']);
    let genderScale = d3.scaleOrdinal()
        .domain(categoriesList['accepted_gender'])
        .range(['#81AA91', '#684F42', '#CFB76D', '#FFFFFF']);

    // check if svg has already been created and if not, creates it
    if (!this.svg) {
        this.svg = d3.select(this.id)
            .append('svg')
            .classed('map-container', true);
        svg = this.svg;
        mapGroup = svg.append('g').classed('map-swiss', true);
        swissBorderContainer = mapGroup.append('g').classed('map-country', true);
        cantonsBorderContainer = mapGroup.append('g').classed('map-cantons', true);
        dotGroup = svg.append('g').classed('map-dots', true);
        legendGroup = svg.append('g').classed('map-legend', true);
    }

    this.draw = function(year, category) {
        //remove precedent map with a transition
        d3.selectAll('#maps-visualization .maps-swiss path')
            .transition()
            .duration(250)
            .style('opacity', 1e-6)
            .remove();
        d3.selectAll('#maps-visualization .maps-dots circle')
            .transition()
            .duration(250)
            .attr('r', 1e-6)
            .remove();
        d3.selectAll('#maps-visualization .maps-label text')
            .transition()
            .duration(250)
            .style('opacity', 1e-6)
            .remove();
        d3.select('#maps-visualization .maps-container')
            .classed('map-on', false)
            .style('pointer-events', 'none');
        d3.select('#maps-visualization .maps-container rect')
            .style('pointer-events', 'none');

        d3.selectAll('body > .tooltip')
            .transition()
            .duration(250)
            .style('opacity', 1e-6)
            .remove();

        //calculate width and height of the viz container and set them as svg dimensions
        width = $('#maps-visualization').width();
        vHeight = $('#maps').height() - 50;

        let subchapterWidth = $('#temporal-framing').width();
        if (subchapterWidth < 700) {
            height = width * .85;
            if (height > vHeight) {
                height = vHeight;
            }
            radius = 1.8;
        } else {
            height = width * .7;
            if (height > vHeight) {
                height = vHeight;
            }
            radius = 3;
        }

        svg.classed('map-on', true)
            .attr('width', width)
            .attr('height', height)
            .attr('data-category', function(d){
                if (category == undefined) {
                    return 'typology';
                } else {
                    return category;
                }
            })
            .style('position', 'absolute');

        // adapt map to viewport
        projection.fitSize([width, height], cantons);

        // project map
        let swissBorder = swissBorderContainer.selectAll('path')
            .data(swissOutline.features);

        swissBorder.exit()
            .transition()
            .duration(350)
            .style('opacity', 1e-6)
            .remove();

        swissBorder.enter()
            .append('path')
            .classed('swiss-contour', true)
            .style('opacity', 1e-6)
            .merge(swissBorder)
            .attr("d", path)
            .transition()
            .duration(350)
            .style('opacity', 0.5);

        let cantonsBorder = cantonsBorderContainer.selectAll('path')
            .data(function(d){
                if (year < 1980 && year != 1900) {
                    return oldCantons.features;
                } else {
                    return cantons.features;
                }
            });

        cantonsBorder.exit()
            .transition()
            .duration(350)
            .style('opacity', 1e-6)
            .remove();

        cantonsBorder.enter()
            .append('path')
            .classed('canton-contour', true)
            .style('opacity', 1e-6)
            .merge(cantonsBorder)
            .attr('d', path)
            .transition()
            .duration(350)
            .style('opacity', 0.5);

        //filter the data for the correct year
        let selectedYear,
            institutions;
        if (year == 1900) {
            selectedYear = this.allData;
            institutions = selectedYear.map(function(d){
                return {
                    'x' : getCoordinates(d.values[0], 'lon'),
                    'y' : getCoordinates(d.values[0], 'lat'),
                    'id': d.key,
                    'capacity_group': d.values[0].capacity_group,
                    'confession': d.values[0].confession,
                    'accepted_gender': d.values[0].accepted_gender
                };
            });
            // console.log('ciao');
        } else {
            selectedYear = this.data.filter(function(el){return el.key == year;});
            // console.log(selectedYear);
            institutions = selectedYear[0].values.map(function(d){
                return {
                    'x' : getCoordinates(d, 'lon'),
                    'y' : getCoordinates(d, 'lat'),
                    'id': d.id,
                    'capacity_group': d.capacity_group,
                    'confession': d.confession,
                    'accepted_gender': d.accepted_gender
                };
            });
        }
        // console.log(institutions);

        //draw institutions
        node = dotGroup.selectAll('circle')
            .data(institutions, function(d){
                return d.id;
            });

        node.exit()
            .transition()
            .duration(350)
            .attr('r', 1e-6)
            .remove();

        if (category !== undefined) {

            node = node.enter()
                .append('circle')
                .classed('dot', true)
                .attr('r', 1e-6)
                .on("click", function(d) {
                    let activeYear = $('#maps .active-year').attr('data-id');
                    buildSidepanel(d.id, activeYear);
                })
                .merge(node)
                .attr('data-toggle', 'tooltip')
                .attr('data-placement', 'top')
                .attr('data-html', 'true')
                .attr('title', function(d){
                    let thisRecord = masterData.filter(function(e){
                        return e.id == d.id;
                    })[0]
                    let name_landmark = thisRecord.name_landmark;
                    let city = thisRecord.city;
                    let canton_code = thisRecord.canton_code;
                    return `<div class="viz-tooltip"><span>${name_landmark}</span><br/><span>${city}, ${canton_code}</span></div>`;
                })
                .attr('data-hover', function(d){
                    return d[category];
                })
                .attr('stroke', function(d) {
                    if ((category === 'capacity_group' && d.capacity_group == "non indicato") || (category === 'confession' && d.confession == "non indicato") || (category === 'accepted_gender' && d.accepted_gender == "non indicato")) {
                        return '#074050';
                    }
                })
                .attr('stroke-width', function(d) {
                    if ((category === 'capacity_group' && d.capacity_group == "non indicato") || (category === 'confession' && d.confession == "non indicato") || (category === 'accepted_gender' && d.accepted_gender == "non indicato")) {
                        return .5 + 'px';
                    }
                })
                .style('fill', function(d){
                    if (category === 'capacity_group') {
                        return capacityScale(d[category]);
                    } else if (category === 'confession') {
                        return confessionScale(d[category]);
                    } else {
                        return genderScale(d[category]);
                    }
                });

            node.transition()
                .duration(350)
                .delay(function(d, i) { return i * 2 })
                // .style('fill', function(d){
                //     if (category === 'capacity_group') {
                //         return capacityScale(d[category]);
                //     } else if (category === 'confession') {
                //         return confessionScale(d[category]);
                //     } else {
                //         return genderScale(d[category]);
                //     }
                // })
                .attr('r', radius);

            if (currentMapsCategory != category) {
                // add legend
                item = legendGroup.selectAll('.item')
                    .data(categoriesList[category]);

                item.exit()
                    .transition()
                    .duration(350)
                    .style('opacity', 1e-6)
                    .remove();

                item = item.enter()
                    .append('g')
                    .classed('item', true)
                    .style('cursor', 'pointer')
                    .merge(item)
                    .attr('data-hover', function(d){
                        return d;
                    })
                    .on('mouseenter', function(d) {
                        d3.selectAll('#maps .dot')
                            .transition()
                            .duration(350)
                            .style('opacity', .1)

                        d3.selectAll('#maps .dot[data-hover="' + d + '"]')
                            .transition()
                            .duration(350)
                            .style('opacity', 1)
                    })
                    .on('mouseleave', function(d) {
                        d3.selectAll('#maps .dot')
                            .transition()
                            .duration(350)
                            .style('opacity', 1)
                    });

                item.selectAll('*')
                    .transition()
                    .duration(350)
                    .style('opacity', 1e-6)
                    .remove();

                item.append('rect')
                    .classed('item-color', true)
                    .style('opacity', 1e-6)
                    .attr('width', 15)
                    .attr('height', 15)
                    .attr('x', function(d){
                        if (subchapterWidth < 700) {
                            return 5;
                        } else {
                            return 15;
                        }
                    })
                    .attr('y', function(d, i){
                        return i * 20;
                    })
                    .transition()
                    .duration(350)
                    .delay(function(d, i) { return i * 2 })
                    .style('fill', function(d){
                        if (category === 'capacity_group') {
                            return capacityScale(d);
                        } else if (category === 'confession') {
                            return confessionScale(d);
                        } else {
                            return genderScale(d);
                        }
                    })
                    .attr('stroke', function(d) {
                        if (d == "non indicato") {
                            return '#074050';
                        }
                    })
                    .attr('stroke-width', function(d) {
                        if (d == "non indicato") {
                            return .5 + 'px';
                        }
                    })
                    .style('opacity', 1);

                item.append('text')
                    .classed('item-text', true)
                    .style('opacity', 1e-6)
                    .attr('x', function(d){
                        if (subchapterWidth < 700) {
                            return 30;
                        } else {
                            return 40;
                        }
                    })
                    .attr('y', function(d, i){
                        return i * 20 + 12;
                    })
                    .text(function(d){
                        return d;
                    })
                    .transition()
                    .duration(350)
                    .delay(function(d, i) { return i * 2 })
                    .style('opacity', 1);

                currentMapsCategory = category;
            }
        } else {
            node = node.enter()
                .append('circle')
                .classed('dot', true)
                .attr('r', 1e-6)
                .on("click", function(d) {
                    let activeYear = $('#maps .active-year').attr('data-id');
                    buildSidepanel(d.id, activeYear);
                })
                .merge(node)
                .attr('data-toggle', 'tooltip')
                .attr('data-placement', 'top')
                .attr('data-html', 'true')
                .attr('title', function(d){
                    let thisRecord = masterData.filter(function(e){
                        return e.id == d.id;
                    })[0]
                    let name_landmark = thisRecord.name_landmark;
                    let city = thisRecord.city;
                    let canton_code = thisRecord.canton_code;
                    return `<div class="viz-tooltip"><span>${name_landmark}</span><br/><span>${city}, ${canton_code}</span></div>`;
                })
                .style('fill', function(d){
                    return 'black';
                });

            node.transition()
                .duration(350)
                .delay(function(d, i) { return i * 2 })
                .attr('r', radius);

            currentMapsCategory = 'none';
        }

        simulation.alpha(1)
            .nodes(institutions)
            .force('x', d3.forceX().x(function(d) {
                return d.x;
            }).strength(0.2))
            .force('y', d3.forceY().y(function(d) {
                return d.y;
            }).strength(0.2))
            .force('collision', d3.forceCollide().radius(function(d) {
                return radius + 0.5;
            }))
            .restart();

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    }

    function getCoordinates(d, i) {
        var projectedCoords = projection([d.lon, d.lat]);
        // console.log(projectedCoords);
        if (i === 'lon') {
            return projectedCoords[0];
        } else if (i === 'lat') {
            return projectedCoords[1];
        } else {
            return projectedCoords;
        }
    }

    function ticked() {
        node.attr('cx', function(d){return d.x;})
            .attr('cy', function(d){return d.y;});
    }
}
