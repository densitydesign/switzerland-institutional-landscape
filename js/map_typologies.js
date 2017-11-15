function MapTypologies(id, swiss, data) {

    this.id = id;

    if (data) {
        this.data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        // console.log(data);
        // console.log(swiss);
    }
    //define elements that will be present in the visualization
    let div,
        mapsSvg,
        mapGroups,
        swissBorderContainer,
        cantonsBorderContainer,
        dotsGroup,
        labelsGroup;

    //define dimensions of the container
    let width,
        height,
        radius;


    // define projection and path-generator variables
    let projection = d3.geoMercator(),
        path = d3.geoPath().projection(projection);

    // transform topojson to geojson
    let swissOutline = topojson.feature(swiss, swiss.objects.country),
        cantons = topojson.feature(swiss, swiss.objects.cantons);

    // check if svg has already been created and if not, creates it
    if (!this.div_typology) {
        this.div_typology = d3.select(this.id)
            .append('div')
            .classed('maps-container', true);
        div = this.div_typology;
        mapsSvg = div.selectAll('.maps-svg')
            .data(["forced labour institution (restricted)", "forced labour institution (semi-open)", "educational institution", "asylum for alcoholics", "prison", "psychiatric facility", "poor house", "institution for people with special needs"])
            .enter()
            .append('svg')
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
            .duration(400)
            .style('opacity', 1e-6)
            .remove();
        d3.selectAll('#maps-visualization .map-dots circle')
            .transition()
            .duration(400)
            .attr('r', 1e-6)
            .remove();
        d3.select('#maps-visualization .maps-container')
            .style('pointer-events', 'auto');

        //calculate width and height for each small map
        width = $('#maps-visualization').width() / 3 - 30;
        height = width * .9;
        radius = 2;
        mapsSvg.attr('width', width)
            .attr('height', height);

        // adapt map to viewport
        projection.fitSize([width, height], cantons);

        // project map
        let swissBorder = swissBorderContainer.selectAll('path')
            .data(swissOutline.features);

        swissBorder.exit()
            .transition()
            .duration(500)
            .style('opacity', 1e-6)
            .remove();

        swissBorder.enter()
            .append('path')
            .classed('swiss-contour', true)
            .style('opacity', 1e-6)
            .merge(swissBorder)
            .attr("d", path)
            .transition()
            .duration(500)
            .style('opacity', 0.5);

        let cantonsBorder = cantonsBorderContainer.selectAll('path')
            .data(cantons.features);

        cantonsBorder.exit()
            .transition()
            .duration(500)
            .style('opacity', 1e-6)
            .remove();

        cantonsBorder.enter()
            .append('path')
            .classed('canton-contour', true)
            .style('opacity', 1e-6)
            .merge(cantonsBorder)
            .attr('d', path)
            .transition()
            .duration(500)
            .style('opacity', 0.5);

        // add labels to maps
        let label = labelsGroup.selectAll('.maps-label')
            .data(function(d) { return [d]; });

        label.exit()
            .transition()
            .duration(500)
            .style('opacity', 1e-6)
            .remove();

        label.enter()
            .append('text')
            .classed('maps-label', true)
            .style('opacity', 1e-6)
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .merge(label)
            .text(function(d){return d;})
            .transition()
            .duration(500)
            .style('opacity', 1);

        // filter the data for the correct year
        let selectedYear = this.data.filter(function(el){return el.key == year;});
        let typologies = d3.nest()
            .key(function(d) { return d.typology; })
            .entries(selectedYear[0].values);
        // console.log(typologies);

        dotGroups.each(function(d){
            // check if a typology is present a certain year
            let svgIndex = typologies.findIndex(isPresent);
            // if there is, update the svg
            if (svgIndex != -1) {
                // define data for each category
                let institutions = typologies[svgIndex].values.map(function(d){
                    return {
                        'x' : getCoordinates(d, 'lon'),
                        'y' : getCoordinates(d, 'lat'),
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
                    .duration(500)
                    .attr('r', 1e-6)
                    .remove();

                node = node.enter()
                    .append('circle')
                    .classed('dot', true)
                    .attr('r', 1e-6)
                    .on("click", function(d) {
                        console.log(d.id);
                    })
                    .merge(node);

                node.transition()
                    .duration(500)
                    .delay(function(d, i) { return i * 2 })
                    .attr('r', radius);

                d3.forceSimulation().alpha(1)
                    .nodes(institutions)
                    .force('x', d3.forceX().x(function(d) {
                        return d.x;
                    }).strength(0.1))
                    .force('y', d3.forceY().y(function(d) {
                        return d.y;
                    }).strength(0.1))
                    .force('collision', d3.forceCollide().radius(function(d) {
                        return radius + 0.5;
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
                    .duration(500)
                    .attr('r', 1e-6)
                    .remove();
            }
            function isPresent(el) {
                return el.key === d;
            }
        });

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
}
