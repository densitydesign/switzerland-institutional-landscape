function AcceptingInstitutions(id, data, swiss, direction) {

    console.log('accepting institutions');
    console.log(data);

    this.id = id;

    let svg,
        nodes = [],
        mapData,
        fixedRadius = 2;

    if (!this.svg) {
        // check if svg has been craeted, if not runs init()
        svg = this.svg = d3.select(this.id).append('svg');
    }

    let projection = d3.geoMercator(),
        path = d3.geoPath().projection(projection);

    let cantonsBorders = svg.append('g').classed('cantons-map', true).selectAll('path'),
        node = svg.append("g").selectAll(".node");

    let cantonsLabels = d3.select('.cantons-map').selectAll('text')

    let simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(function(d) { return d[0] }))
        .force("y", d3.forceY(function(d) { return d[1] }))
        .force("collide", d3.forceCollide(function(d) { return fixedRadius + 0.5 }))
        // general force settings
        .alpha(1)
        .alphaDecay(0.01)
        .on("tick", null)

    this.draw = function(year, direction) {

        let thisData;
        if (year) {
            thisData = data[year];
        } else {
            thisData = data[1954];
        }
        console.log(direction, thisData)

        width = d3.select(this.id)
            .node()
            .offsetWidth - 30;

        height = width * .6;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        svg.attr('width', width)
            .attr('height', height);

        // svg.style('border', '1px solid red')

        // transform topojson to geojson
        let cantons = topojson.feature(swiss, swiss.objects.cantons);

        // adapt map to viewport
        projection.fitSize([width, height], cantons);

        // project map, responsive
        cantonsBorders = cantonsBorders.data(cantons.features);
        cantonsBorders.exit().remove();
        cantonsBorders = cantonsBorders.enter()
            .append('path')
            .classed('canton-contour', true)
            .style('fill', '#eee')
            .on("mouseenter", function(d) {
                // console.log(d.properties.abbr);
                d3.selectAll(id + ' .canton-contour').each(function(e) {
                    if (e.properties.abbr == d.properties.abbr) {
                        d3.select(this).style('opacity', .8).style('fill', '#ccc');
                    } else {
                        d3.select(this).style('opacity', .4)
                    }
                })
                d3.selectAll(id + ' .label').each(function(e) {
                    if (e.properties.abbr == d.properties.abbr) {
                        d3.select(this).style('opacity', 1);
                    } else {
                        d3.select(this).style('opacity', 0)
                    }
                })
            })
            .on("mouseout", function(d) {
                // console.log(d.properties.abbr);
                d3.selectAll(id + ' .canton-contour').style('opacity', .8).style('fill', '#eee')
                d3.selectAll(id + ' .label').style('opacity', 1)
            })
            .on("click", function(d) {
                console.log(direction, d.properties.abbr);

                let relatedInstitutions = [];
                if ( direction == 'from' ){
                    thisData.edges.filter(function(e){ return e.source.id == d.properties.abbr }).forEach(function(e){
                        relatedInstitutions = relatedInstitutions.concat(e.target_institutions);
                    })
                } else {
                    thisData.edges.filter(function(e){ return e.target.id == d.properties.abbr }).forEach(function(e){
                        relatedInstitutions = relatedInstitutions.concat(e.target_institutions);
                    })
                }
                console.log('from this canton', relatedInstitutions);
            })
            .merge(cantonsBorders)
            .attr('d', path);

        cantonsLabels = cantonsLabels.data(cantons.features);
        cantonsLabels.exit().remove();
        cantonsLabels = cantonsLabels.enter()
            .append('text')
            .classed('label', true)
            .attr('text-anchor', 'middle')
            .text(function(d) {
                return d.properties.name
            })
            .attr('x', function(d) {
                d.labelPosition = turf.centerOfMass(d);
                return projection(d.labelPosition.geometry.coordinates)[0];
            })
            .attr('y', function(d) {
                return projection(d.labelPosition.geometry.coordinates)[1];
            })
            .merge(cantonsLabels);

    } // draw

} // all