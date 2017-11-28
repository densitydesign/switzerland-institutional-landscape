function AcceptingInstitutions(id, data, swiss) {

    // console.log('accepting institutions');
    console.log(data);

    this.id = id;

    let svg,
        nodes = [],
        mapData,
        fixedRadius = 3.5;

    if (!this.svg) {
        // check if svg has been craeted, if not runs init()
        svg = this.svg = d3.select(this.id).append('svg');
    }

    let projection = d3.geoMercator(),
        path = d3.geoPath().projection(projection);

    let resetRect = svg.append('rect'),
        cantonsBorders = svg.append('g').classed('cantons-map', true).selectAll('path'),
        node = svg.append("g").selectAll(".node");

    let cantonsLabels = d3.select('.cantons-map').selectAll('text')

    let simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(function(d) { return d.centerX }))
        .force("y", d3.forceY(function(d) { return d.centerY }))
        // .force("x", d3.forceX())
        // .force("y", d3.forceY())
        .force("collide", d3.forceCollide(function(d) { return fixedRadius + 0.5 }))
        // general force settings
        .alpha(1)
        .alphaDecay(0.01)
        .on("tick", null)

    this.draw = function(config) {

        let thisData = null;

        if (config.year) {
            console.log(config.year)
            thisData = data[config.year];
        } else {
            thisData = data[1954];
        }

        console.log(thisData)

        // console.log(config, thisData);

        width = d3.select(this.id)
            .node()
            .offsetWidth - 30;

        height = width * .6;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        svg.attr('width', width)
            .attr('height', height);

        resetRect
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'white')
            .on('click', function() {
                reset();
            })

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
            // .style('fill', '#eee')
            // .on("mouseenter", function(d) {
            //     // Manage hightlitment of cantons areas on mouseover
            //     d3.selectAll(id + ' .canton-contour').each(function(e) {
            //         if (e.properties.abbr == d.properties.abbr) {
            //             d3.select(this).style('opacity', .8).style('fill', '#ccc');
            //         } else {
            //             d3.select(this).style('opacity', .4)
            //         }
            //     })
            //     d3.selectAll(id + ' .label').each(function(e) {
            //         if (e.properties.abbr == d.properties.abbr) {
            //             d3.select(this).style('opacity', 1);
            //         } else {
            //             d3.select(this).style('opacity', 0)
            //         }
            //     })
            // })
            // .on("mouseout", function(d) {
            //     // Manage hightlitment of cantons areas on mouseover
            //     d3.selectAll(id + ' .canton-contour').style('opacity', .8).style('fill', '#eee')
            //     d3.selectAll(id + ' .label').style('opacity', 1)
            // })
            .on("click", function(d) {
                console.log(d)

                d3.selectAll(id + ' .canton-contour')
                    .styles({
                        "fill": "#E2D4A7",
                        "stroke": "none",
                        "opacity": ".5"
                    });

                d3.selectAll(id + ' .label')
                    .styles({
                        "opacity": "0.3"
                    });

                // Gather data for intitutions
                let relatedInstitutions = [];
                let sendingCantons = [];
                if (config.direction == 'from') {
                    thisData.edges.filter(function(e) { return e.source.id == d.properties.abbr }).forEach(function(e) {
                        relatedInstitutions = relatedInstitutions.concat(e.target_institutions);
                    })
                    // d3.select(this)
                    //     .styles({
                    //         "fill": "#FF7070",
                    //         "stroke": '#802626',
                    //         "opacity": "1"
                    //     })
                    sendingCantons.push(d.properties.abbr);
                } else {
                    thisData.edges.filter(function(e) { return e.target.id == d.properties.abbr }).forEach(function(e) {
                        relatedInstitutions = relatedInstitutions.concat(e.target_institutions);
                        sendingCantons.push(e.source.id)
                    })
                }

                // filter institutions from masterData
                let filteredMD = [];
                relatedInstitutions.forEach(function(e) {
                    let myItem = masterData.filter(function(f) { return e == f.id })[0];
                    filteredMD.push(myItem);
                })

                if (relatedInstitutions.length > 0) {
                    filteredMD.forEach(function(e) {
                        e.centerX = e.x = projection([e.longitude, e.latitude])[0]
                        e.centerY = e.y = projection([e.longitude, e.latitude])[1]
                    })

                    // highlights receiving cantons (multiple ones when direction is from, single one when direction is into)
                    d3.nest().key(function(e) { return e.canton_code }).rollup(function(e) { return e.value }).entries(filteredMD).forEach(function(e) {

                        d3.selectAll(id + ' .canton-contour')
                            .filter(function(f) { return f.properties.abbr == e.key })
                            .styles({
                                "opacity": "1",
                                "stroke": '#666',
                            })

                        d3.selectAll(id + ' .label')
                            .filter(function(f) { return f.properties.abbr == e.key })
                            .styles({
                                "opacity": "1"
                            })
                    })

                    sendingCantons.forEach(function(e) {
                        d3.selectAll(id + ' .canton-contour')
                            .filter(function(f) { return f.properties.abbr == e })
                            .styles({
                                "fill": "#FF7070",
                                "stroke": '#802626',
                                "opacity": "1"
                            })

                        d3.selectAll(id + ' .label')
                            .filter(function(f) { return f.properties.abbr == e })
                            .styles({
                                "opacity": "1"
                            })
                    })
                } else {
                    console.log('no receiving institutions')
                }
                nodes = filteredMD;
                update();

                d3.selectAll(id + ' .label')
                    .filter(function(f) { return f.properties.abbr == d.properties.abbr })
                    .styles({
                        "opacity": "1"
                    })

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
            .merge(cantonsLabels)
            .attr('x', function(d) {
                d.labelPosition = turf.centerOfMass(d);
                return projection(d.labelPosition.geometry.coordinates)[0];
            })
            .attr('y', function(d) {
                return projection(d.labelPosition.geometry.coordinates)[1];
            });


        function update() {

            // Apply general update pattern to nodes
            node = node.data(nodes, function(d) { return d.id; });
            node.exit().transition()
                .duration(500)
                .attr('r', 0)
                .remove();

            node = node.enter()
                .append("circle")
                .classed('node', true)
                .attr("r", 0)
                .styles({
                    'fill': '#ff4c4c',
                    'stroke': '#333333',
                    'stroke-width': '0.5px'
                })
                .on('click', function(d) {
                    console.log(d);
                })
                .on('mouseenter', function(d) {
                    d3.select(this).transition()
                        .duration(300)
                        .attr('r', fixedRadius * 1.5)
                })
                .on('mouseout', function(d) {
                    d3.select(this).transition()
                        .duration(300)
                        .attr('r', fixedRadius)
                })
                .merge(node);

            node.transition()
                .duration(500)
                .attr('r', fixedRadius)

            simulation
                .nodes(nodes)
                .alpha(1)
                .on("tick", ticked)
                .restart();

            function ticked() {
                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });

                // link.attr("x1", function(d) { return d.source.x; })
                //     .attr("y1", function(d) { return d.source.y; })
                //     .attr("x2", function(d) { return d.target.x; })
                //     .attr("y2", function(d) { return d.target.y; });

                // label.attr("x", function(d) { return d.x; })
                //     .attr("y", function(d) { return d.y; });
            }
        }
        reset();
        function reset() {
            d3.selectAll(id + ' .canton-contour')
                .styles({
                    "fill": "#EEE5CA",
                    "stroke": "#666666",
                    "opacity": "1"
                });

            d3.selectAll(id + ' .label')
                .styles({
                    "opacity": "1"
                });

            node = node.data([], function(d) { return d.id; });
            node.exit().transition()
                .duration(500)
                .attr('r', 0)
                .remove();
        }


    } // draw

} // all