function MapAll(id, swiss, data) {

    this.id = id;

    if (data) {
        this.data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        // console.log(this.data);
        // console.log(swiss);
    }
    //define elements that will be present in the visualization
    let svg,
        mapGroup,
        swissBorderContainer,
        cantonsBorderContainer,
        dotGroup,
        node;

    //define dimensions of the container
    let width,
        height,
        radius;

    let institutions = [];

    // define projection and path-generator variables
    let projection = d3.geoMercator(),
        path = d3.geoPath().projection(projection);

    // transform topojson to geojson
    let swissOutline = topojson.feature(swiss, swiss.objects.country),
        cantons = topojson.feature(swiss, swiss.objects.cantons);

    // define forces
    let simulation = d3.forceSimulation(institutions)
        .on("tick", ticked);

    // check if svg has already been created and if not, creates it
    if (!this.svg) {
        this.svg = d3.select(this.id)
            .append('svg')
            .classed('map-container', true);
        svg = this.svg;
        mapGroup = svg.append('g').classed('map-swiss', true);
        swissBorderContainer = mapGroup.append('g').classed('map-country', true);
        cantonsBorderContainer = mapGroup.append('g').classed('map-cantons', true);
        dotGroup = svg.append('g').classed('dots', true);
    }

    this.draw = function(year) {
        //calculate width and height of the viz container and set them as svg dimensions
        width = $('#maps-visualization').width();
        height = width * .7;
        radius = 3;
        svg.attr('width', width)
            .attr('height', height);

        // svg.selectAll('.map-swiss *').remove();

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
            .duration(300)
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
            .duration(300)
            .style('opacity', 0.5);

        //filter the data for the correct year
        let selectedYear = this.data.filter(function(el){return el.key == year;});
        institutions = selectedYear[0].values.map(function(d){
            return {
                'x' : getCoordinates(d, 'lon'),
                'y' : getCoordinates(d, 'lat'),
                'id': d.id
            };
        });
        // console.log(institutions);

        //draw institutions
        node = dotGroup.selectAll('circle')
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
            .attr('r', radius)

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
