function MapTypologies(id, swiss, data) {

    this.id = id;

    if (data) {
        this.data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        // console.log(data);
        // console.log(swiss);
    }

    let categories = ["arbeitsanstalt", "arbeiterkolonie", "erziehungsanstalt", "trinkerheilanstalt", "strafanstalt", "psychiatrische einrichtung", "armenhaus", "spezialanstalt/sonderanstalt"];

    //define elements that will be present in the visualization
    let mapsSvg,
        mapGroups,
        swissBorderContainer,
        cantonsBorderContainer,
        dotsGroup,
        labelsGroup;

    //define dimensions of the container
    let width,
        height,
        radius,
        mapsWidth,
        mapsHeight;

    let horizontalSpacer,
        horizontalSpacerAlternative,
        verticalSpacer,
        secondColumn,
        secondColumnAlternative,
        thirdColumn,
        secondRow,
        thirdRow;


    // define projection and path-generator variables
    let projection0 = d3.geoMercator(),
        path0 = d3.geoPath().projection(projection0);
    let projection1 = d3.geoMercator(),
        path1 = d3.geoPath().projection(projection1);
    let projection2 = d3.geoMercator(),
        path2 = d3.geoPath().projection(projection2);
    let projection3 = d3.geoMercator(),
        path3 = d3.geoPath().projection(projection3);
    let projection4 = d3.geoMercator(),
        path4 = d3.geoPath().projection(projection4);
    let projection5 = d3.geoMercator(),
        path5 = d3.geoPath().projection(projection5);
    let projection6 = d3.geoMercator(),
        path6 = d3.geoPath().projection(projection6);
    let projection7 = d3.geoMercator(),
        path7 = d3.geoPath().projection(projection7);

    // transform topojson to geojson
    let swissOutline = topojson.feature(swiss, swiss.objects.country),
        cantons = topojson.feature(swiss, swiss.objects.cantons),
        oldCantons = topojson.feature(swiss, swiss.objects.cantons),
        union = turf.union(oldCantons.features[1], oldCantons.features[25]);

    oldCantons.features[1] = union;
    oldCantons.features.pop();

    // set variables for zoom
    let zoom = d3.zoom()
        .on("zoom", zoomed);

    let initialTransform = d3.zoomIdentity
        .translate(0,-10)
        .scale(1);

    let active = d3.select(null);

    // check if svg has already been created and if not, creates it
    if (!this.div_typology) {
        this.div_typology = d3.select(this.id)
            .append('svg')
            .classed('maps-container', true);
        svg = this.div_typology;
        mapRect = svg.append('rect')
            .classed('map-background', true);
        g = svg.append('g').classed('maps-group', true);
        mapsSvg = g.selectAll('.maps-svg')
            .data(categories)
            .enter()
            .append('g')
            .classed('maps-svg', true);
        mapGroups = mapsSvg.append('g').classed('maps-swiss', true);
        swissBorderContainer = mapGroups.append('g').classed('maps-country', true);
        cantonsBorderContainer = mapGroups.append('g').classed('maps-cantons', true);
        dotGroups = mapsSvg.append('g').classed('maps-dots', true);
        labelsGroup = mapsSvg.append('g').classed('maps-label', true);
    }

    this.draw = function(year) {
        //remove precedent map with a transition
        d3.selectAll('#maps-visualization .map-swiss path')
            .transition()
            .duration(250)
            .style('opacity', 1e-6)
            .remove();
        d3.selectAll('#maps-visualization .map-dots circle')
            .transition()
            .duration(250)
            .attr('r', 1e-6)
            .remove();
        d3.selectAll('#maps-visualization .map-legend .item')
            .transition()
            .duration(250)
            .style('opacity', 1e-6)
            .remove();
        d3.select('#maps-visualization .map-container')
            .classed('map-on', false)
            .attr('data-category', 'hidden');
        d3.select('#maps-visualization .maps-container')
            .style('pointer-events', 'auto');
        d3.select('#maps-visualization .maps-container rect')
            .style('pointer-events', 'all');

        d3.selectAll('body > .tooltip')
            .transition()
            .duration(250)
            .style('opacity', 1e-6)
            .remove();

        currentMapsCategory = 'none';

        //calculate width and height for each small map
        width = $('#maps-visualization').width();
        vHeight = $('#maps').height() - 50;
        height = width * .8;
        if (height > vHeight) {
            height = vHeight;
        }
        radius = 1.75;
        mapsWidth = width / 3 - 30;
        mapsHeight = mapsWidth * .7;

        // calculate distances to distribute the maps equally
        horizontalSpacer = (width - 3 * mapsWidth) / 2;
        horizontalSpacerAlternative = (width - 2 * mapsWidth) / 3;
        verticalSpacer = (height - 3 * mapsHeight) / 2;
        secondColumn = mapsWidth + horizontalSpacer;
        secondColumnAlternative = 2 * horizontalSpacerAlternative + mapsWidth;
        thirdColumn = 2 * secondColumn;
        secondRow = mapsHeight + verticalSpacer;
        thirdRow = 2 * secondRow;

        svg.classed('map-on', true)
            .attr('width', width)
            .attr('height', height);

        mapRect.attr('width', width)
            .attr('height', height)
            .on("click", reset);

        // adapt map to viewport
        projection0.fitExtent([[0, 0],[mapsWidth, mapsHeight]], cantons);
        projection1.fitExtent([[secondColumn, 0],[mapsWidth + secondColumn, mapsHeight]], cantons);
        projection2.fitExtent([[thirdColumn, 0],[mapsWidth + thirdColumn, mapsHeight]], cantons);
        projection3.fitExtent([[0, secondRow],[mapsWidth, mapsHeight + secondRow]], cantons);
        projection4.fitExtent([[secondColumn, secondRow],[mapsWidth + secondColumn, mapsHeight + secondRow]], cantons);
        projection5.fitExtent([[thirdColumn, secondRow],[mapsWidth + thirdColumn, mapsHeight + secondRow]], cantons);
        projection6.fitExtent([[horizontalSpacerAlternative, thirdRow],[mapsWidth + horizontalSpacerAlternative, mapsHeight + thirdRow]], cantons);
        projection7.fitExtent([[secondColumnAlternative, thirdRow],[mapsWidth + secondColumnAlternative, mapsHeight + thirdRow]], cantons);

        // svg.call(zoom)
            svg.call(zoom.transform, initialTransform);

        // d3.select('#maps .text-right').on("click", reset);

        // project map
        let swissBorder = swissBorderContainer.selectAll('path')
            .data(function(d,i) {
                return [{
                    index: i,
                    shape: swissOutline.features[0]
                }]
            });

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
            .attr("d", function(d){
                switch (d.index) {
                    case 1:
                        return path1(d.shape);
                        break;
                    case 2:
                        return path2(d.shape);
                        break;
                    case 3:
                        return path3(d.shape);
                        break;
                    case 4:
                        return path4(d.shape);
                        break;
                    case 5:
                        return path5(d.shape);
                        break;
                    case 6:
                        return path6(d.shape);
                        break;
                    case 7:
                        return path7(d.shape);
                        break;
                    default:
                        return path0(d.shape);
                }
            })
            .transition()
            .duration(350)
            .style('opacity', 0.5);

        let cantonsBorder = cantonsBorderContainer.selectAll('path')
            .data(function(d,i){
                if (year < 1980 && year != 1900) {
                    return oldCantons.features.map(function(el){
                        return {
                            index: i,
                            shape: el
                        }
                    })
                } else {
                    return cantons.features.map(function(el){
                        return {
                            index: i,
                            shape: el
                        }
                    })
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
            .attr("d", function(d){
                switch (d.index) {
                    case 1:
                        return path1(d.shape);
                        break;
                    case 2:
                        return path2(d.shape);
                        break;
                    case 3:
                        return path3(d.shape);
                        break;
                    case 4:
                        return path4(d.shape);
                        break;
                    case 5:
                        return path5(d.shape);
                        break;
                    case 6:
                        return path6(d.shape);
                        break;
                    case 7:
                        return path7(d.shape);
                        break;
                    default:
                        return path0(d.shape);
                }
            })
            .on("click", clicked)
            .transition()
            .duration(350)
            .style('opacity', 0.5);

        // add labels to maps
        let label = labelsGroup.selectAll('.maps-label')
            .data(function(d) { return [d]; });

        label.exit()
            .transition()
            .duration(350)
            .style('opacity', 1e-6)
            .remove();

        label.enter()
            .append('text')
            .classed('maps-label', true)
            .style('opacity', 1e-6)
            .attr('text-anchor', 'middle')
            .style('text-transform', 'capitalize')
            .attr('x', function(d){
                let baseContainer = this.parentNode.parentNode.parentNode.getBoundingClientRect();
                let thisMap = d3.select(this.parentNode.parentNode).select('.maps-swiss').node().getBoundingClientRect();
                return thisMap.left - baseContainer.left + mapsWidth / 2;
            })
            .attr('y', function(d){
                let baseContainer = this.parentNode.parentNode.parentNode.getBoundingClientRect();
                let thisMap = d3.select(this.parentNode.parentNode).select('.maps-swiss').node().getBoundingClientRect();
                return thisMap.top - baseContainer.top + mapsHeight + 6;
            })
            .merge(label)
            .text(function(d){
                if (d == "spezialanstalt/sonderanstalt") {
                    return "Spezialanstalt/Sonderanstalt";
                } else {
                    return d;
                }
            })
            .on("click", clicked)
            .transition()
            .duration(350)
            .style('opacity', 1);

        // d3.selectAll('text.maps-label')
        //     .call(wrap, 120);

        // filter the data for the correct year
        let selectedYear = this.data.filter(function(el){return el.key == year;});
        let typologies = d3.nest()
            .key(function(d) { return d.typology; })
            .entries(selectedYear[0].values);
        // console.log(typologies);

        dotGroups.each(function(d, i){
            //remember which map the data is referred to
            let counter = i;
            // check if a typology is present a certain year
            let svgIndex = typologies.findIndex(isPresent);
            // if there is, update the svg
            if (svgIndex != -1) {
                // define data for each category
                let institutions = typologies[svgIndex].values.map(function(d){
                    return {
                        'x' : getCoordinates(d, 'lon', counter),
                        'y' : getCoordinates(d, 'lat', counter),
                        'id': d.id
                    };
                });

                //draw institutions
                let node = d3.select(this).selectAll('circle')
                    .data(institutions, function(d){
                        return d.id;
                    });

                node.exit()
                    .transition()
                    .duration(350)
                    .attr('r', 1e-6)
                    .remove();

                node = node.enter()
                    .append('circle')
                    .classed('dot-small', true)
                    .attr('r', 1e-6)
                    .on("click", function(d) {
                        let activeYear = $('#maps .active-year').attr('data-id');
                        buildSidepanel(d.id, activeYear);
                    })
                    .on("mouseenter", function(d) {
                        if(active.node() == null) {
                            d3.selectAll('.dot-small')
                                .classed('dot-hover', false)
                                .classed('dot-faded', true)
                                .transition()
                                .duration(500)
                                .ease(d3.easeBackOut.overshoot(4))
                                .attr('r', radius);

                            d3.selectAll('.dot-small[data-id=' + d.id + ']')
                                .classed('dot-faded', false)
                                .classed('dot-hover', true)
                                .transition()
                                .duration(500)
                                .ease(d3.easeBackOut.overshoot(6))
                                .attr('r', radius * 2);
                        }
                    })
                    .on("mouseleave", function(d) {
                        d3.selectAll('.dot-hover')
                            .transition()
                            .duration(500)
                            .ease(d3.easeBackOut.overshoot(4))
                            .attr('r', radius);

                        d3.selectAll('.dot-small')
                            .classed('dot-hover', false)
                            .classed('dot-faded', false)
                    })
                    .merge(node)
                    .attr('data-id', function(d) {
                        return d.id;
                    })
                    .attr('data-toggle', 'tooltip')
                    .attr('data-placement', 'top')
                    .attr('data-html', 'true')
                    .attr('title', function(d){
                        let thisRecord = masterData.find(function(e){
                            return e.id == d.id;
                        })
                        let name_landmark = thisRecord.name_landmark;
                        let city = thisRecord.city;
                        let canton_code = thisRecord.canton_code;
                        return `<div class="viz-tooltip"><span>${name_landmark}</span><br/><span>${city}, ${canton_code}</span></div>`;
                    });

                node.transition()
                    .duration(350)
                    .delay(function(d, i) { return i * 2 })
                    .attr('r', radius);

                d3.forceSimulation().alpha(1).alphaDecay(0.05)
                    .nodes(institutions)
                    .force('x', d3.forceX().x(function(d) {
                        return d.x;
                    }).strength(0.1))
                    .force('y', d3.forceY().y(function(d) {
                        return d.y;
                    }).strength(0.1))
                    .force('collision', d3.forceCollide().radius(function(d) {
                        return radius + 0.25;
                    }))
                    .on("tick", ticked)
                    .restart();

                function ticked() {
                    node.attr('cx', function(d){return d.x;})
                        .attr('cy', function(d){return d.y;});
                }
            } else {
                // if there isn't, clear the svg
                d3.select(this).selectAll('circle')
                    .transition()
                    .duration(350)
                    .attr('r', 1e-6)
                    .remove();
            }
            function isPresent(el) {
                return el.key === d;
            }
        });

        $('#maps .btn-secondary').click(function(){
            reset();
        })

        $('[data-toggle="tooltip"]').tooltip();
    }

    function getCoordinates(d, i, counter) {
        let projectedCoords;
        switch (counter) {
            case 1:
                projectedCoords = projection1([d.lon, d.lat]);
                break;
            case 2:
                projectedCoords = projection2([d.lon, d.lat]);
                break;
            case 3:
                projectedCoords = projection3([d.lon, d.lat]);
                break;
            case 4:
                projectedCoords = projection4([d.lon, d.lat]);
                break;
            case 5:
                projectedCoords = projection5([d.lon, d.lat]);
                break;
            case 6:
                projectedCoords = projection6([d.lon, d.lat]);
                break;
            case 7:
                projectedCoords = projection7([d.lon, d.lat]);
                break;
            default:
                projectedCoords = projection0([d.lon, d.lat]);
        }
        // console.log(projectedCoords);
        if (i === 'lon') {
            return projectedCoords[0];
        } else if (i === 'lat') {
            return projectedCoords[1];
        } else {
            return projectedCoords;
        }
    }

    function zoomed() {
      let transform = d3.event.transform;

      g.attr("transform", transform);
    }

    function reset() {
      active.classed("zoom-active", false);
      active = d3.select(null);

      g.transition()
          .duration(750)
          .call(zoom.transform, initialTransform);
    }

    function clicked(d) {
        let mapData;

        if (this.className.baseVal == 'maps-label') {
            mapData = d3.select(this.parentNode.parentNode).data();
            if (active.node() === this.parentNode.parentNode) return reset();
            active.classed("active", false);
            active = d3.select(this.parentNode.parentNode).classed("zoom-active", true);
        } else {
            mapData = d3.select(this.parentNode.parentNode.parentNode).data();
            if (active.node() === this.parentNode.parentNode.parentNode) return reset();
            active.classed("active", false);
            active = d3.select(this.parentNode.parentNode.parentNode).classed("zoom-active", true);
        }

        let mapIndex = categories.findIndex(function(d){
            return mapData[0] == d;
        })

        let bounds;
        switch (mapIndex) {
            case 1:
                bounds = path1.bounds(swissOutline.features[0].geometry);
                break;
            case 2:
                bounds = path2.bounds(swissOutline.features[0].geometry);
                break;
            case 3:
                bounds = path3.bounds(swissOutline.features[0].geometry);
                break;
            case 4:
                bounds = path4.bounds(swissOutline.features[0].geometry);
                break;
            case 5:
                bounds = path5.bounds(swissOutline.features[0].geometry);
                break;
            case 6:
                bounds = path6.bounds(swissOutline.features[0].geometry);
                break;
            case 7:
                bounds = path7.bounds(swissOutline.features[0].geometry);
                break;
            default:
                bounds = path0.bounds(swissOutline.features[0].geometry);
        }

        let dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.6 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y];


        let transform = d3.zoomIdentity
            .translate(translate[0], translate[1])
            .scale(scale);

        g.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }

    function wrap (text, width) {

        text.each(function() {

            var breakChars = ['/', '&', '-'],
            text = d3.select(this),
            textContent = text.text(),
            spanContent;

            breakChars.forEach(char => {
                // Add a space after each break char for the function to use to determine line breaks
                textContent = textContent.replace(char, char + ' ');
            });

            var words = textContent.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr('x'),
            y = text.attr('y'),
            dy = parseFloat(text.attr('dy') || 0),
            tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    spanContent = line.join(' ');
                    breakChars.forEach(char => {
                        // Remove spaces trailing breakChars that were added above
                        spanContent = spanContent.replace(char + ' ', char);
                    });
                    tspan.text(spanContent);
                    line = [word];
                    tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
                }
            }
        });

    }
}
