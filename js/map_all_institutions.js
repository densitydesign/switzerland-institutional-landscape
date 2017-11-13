function MapAll(id, swiss, data) {

    this.id = id;

    if (data) {
        this.data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        // console.log(this.data);
        // console.log(swiss);
    }

    let svg,
        mapGroup,
        dotGroup,
        node;

    let width,
        height,
        radius;

    let institutions = [];

    // define projection and path-generator variables
    let projection = d3.geoMercator(),
        path = d3.geoPath().projection(projection);

    // transform topojson to geojson
    let cantons = topojson.feature(swiss, swiss.objects.cantons);

    // define forces
    let simulation = d3.forceSimulation(institutions);

    // check if svg has already been created and if not, creates it
    if (!this.svg) {
        this.svg = d3.select(this.id)
            .append('svg')
            .classed('map-container', true);
        svg = this.svg;
        mapGroup = svg.append('g').classed('map-swiss', true);
        dotGroup = svg.append('g').classed('dots', true);
        node = dotGroup.selectAll('circle');
    }

    this.draw = function(year) {
        //calculate width and height of the viz container and set them as svg dimensions
        width = $('#maps-visualization').width();
        height = width * .7;
        radius = 3;
        svg.attr('width', width)
            .attr('height', height);

        svg.selectAll('.map-swiss *').remove();

        // adapt map to viewport
        projection.fitSize([width, height], cantons);

        // project map
        mapGroup.append('g').classed('map-country', true)
            .append('path')
            .datum(topojson.feature(swiss, swiss.objects.country))
            .classed('swiss-contour', true)
            .attr("d", path);

        mapGroup.append('g').classed('map-cantons', true)
            .selectAll('path')
            .data(cantons.features)
            .enter()
            .append('path')
            .classed('canton-contour', true)
            .attr('d', path);

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
        node = node.data(institutions, function(d){
                return d.id;
            });

        node.exit()
            .transition()
            .duration(500)
            .attr('r', 0)
            .remove();

        node = node.enter()
            .append('circle')
            .classed('dot', true)
            .attr('r', 0)
            .on('click', function(d){
                console.table(d);
            })
            .merge(node);

        node.transition()
            .duration(500)
            .delay(function(d, i) { return i * 2 })
            .attr('r', radius);

        simulation.nodes(institutions)
            .force('x', d3.forceX().x(function(d) {
                return d.x;
            }))
            .force('y', d3.forceY().y(function(d) {
                return d.y;
            }))
            .force('collision', d3.forceCollide().radius(function(d) {
                return radius + 0.5;
            }))
            .alpha(1)
            .on('tick', ticked)
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
