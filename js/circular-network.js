function CircularNetwork(id, data) {

    this.id = id;

    let svg,
        width,
        height,
        nodes,
        links,
        simulation,
        g,
        resetRect,
        link,
        node,
        label;

    // red: #F24440
    // blue: #1785FB
    // green: #73C86B

    let color = d3.scaleOrdinal()

        .range(['#ca5268', '#85c4c9', '#97e196', '#888888'])
        .range(['#CFB76D', '#79745C', '#B5BA72', '#EAE6DA'])
        .domain(['c1', 'c2', 'c3', 'not defined'])

    let areaScale = d3.scaleLinear()
        .range([1 * 50, 20 * 50])
        .domain([1, 20])

    let maxWeight = 0;
    Object.keys(data).forEach(function(y) {
        // console.log(data[y])
        let thisMax = d3.max(data[y].edges, function(d) { return d.weight; })
        if (thisMax > maxWeight) { maxWeight = thisMax; }
    })

    let edgeWeight = d3.scaleLinear()
        .range([1, 8])
        .domain([1, maxWeight])


    if (!this.svg) {
        // check if svg has been craeted, if not runs init()
        svg = this.svg = d3.select(this.id).append('svg')
    }

    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 13)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 13)
        .attr('markerHeight', 13)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke', 'none');

    // intialise containers of the graph
    g = svg.append("g");
    resetRect = g.append('rect');
    link = g.append("g")
        .selectAll(".link");

    node = g.append("g")
        .selectAll(".node");

    label = g.append("g")
        .selectAll(".label");

    // intialise variables for data binding
    nodes = [];
    links = [];

    simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links))
        // .force("charge", d3.forceManyBody().strength(-200))
        // .force("x", d3.forceX())
        // .force("y", d3.forceY())
        // .force("collision", null)
        .force("center", d3.forceCenter())
        // .force("r", d3.forceRadial(100))
        .alphaDecay(.02)
        .on("tick", null);

    this.draw = function(year, canton) {

        width = d3.select(this.id)
            .node()
            .offsetWidth - 60;

        let subchapterWidth = $('#temporal-framing').width();
        if (subchapterWidth <= 930) {
            height = width * .8;
        } else {
            height = width * .6;
        }

        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        svg.attr('width', width)
            .attr('height', height);

        if (subchapterWidth <= 930) {
            g.attr("transform", "translate(" + (width / 2 - 40) + "," + height / 2 + ")");
        } else {
            g.attr("transform", "translate(" + (width / 2 - 100) + "," + height / 2 + ")");
        }

        resetRect
            .attr('x', -width / 2)
            .attr('y', -height / 2)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('click', function() {
                d3.selectAll(id + ' .node').style('opacity', 1);
                d3.selectAll(id + ' .link').style('opacity', .5);
            })

        let thisData;
        if (year) {
            thisData = data[year];
        } else {
            thisData = data[1954];
        }

        nodes = thisData.nodes;
        links = thisData.edges;

        let theMax = d3.max(nodes, function(d) { return d.count })

        // console.log(thisData);

        let sumChords = 0;
        nodes.forEach(function(d) {
            let thisRadius = Math.sqrt(d.count / Math.PI);
            thisRadius = Math.sqrt(theMax / Math.PI);
            sumChords += thisRadius * 2;
        });

        let cRadius = sumChords / (Math.PI * 2)
        let scaleFactor = (height * .45) / cRadius

        nodes.forEach(function(d, i) {
            let thisRadius = Math.sqrt(d.count / Math.PI);
            thisRadius = Math.sqrt(theMax / Math.PI);
            let sinAdiv2 = (thisRadius * 2) / (cRadius * 2);
            let angle = Math.asin(sinAdiv2) * 2;
            d.angle = angle;
            if (i > 0) {
                d.angle += nodes[i - 1].angle;
            }
            d.fx = cRadius * Math.cos(d.angle) * scaleFactor;
            d.fy = cRadius * Math.sin(d.angle) * scaleFactor;
        })

        // g.append('circle')
        //     .attr('cx', 0)
        //     .attr('cy', 0)
        //     .attr('r', cRadius * Math.PI * scaleFactor)
        //     .attr('fill', 'none')
        //     .attr('stroke', 'orange')

        // Apply general update pattern to nodes
        node = node.data(nodes, function(d) { return d.id; });
        node.exit().remove();
        node = node.enter()
            .append("circle")
            .classed('node', true)
            .merge(node)
            .attr('stroke', function(d) { return d3.color(color(d.concordat)).darker(.75) })
            .attr('fill', function(d) { return color(d.concordat) })
            .attr("r", function(d) { return Math.sqrt(d.count * scaleFactor * 10 / Math.PI); })
            .style('opacity', function(d){
                if (canton != undefined) {
                    if (d.id == canton) {
                        return 1;
                    } else {
                        return 0.1;
                    }
                } else {
                    return 1;
                }
            })
            .on('click', function(d) {
                let involved_links = links.filter(function(e){
                    return d.id == e.sourceName || d.id == e.targetName;
                })

                let involved_facilities = [];

                involved_links.forEach(function(e){
                    e.target_institutions.forEach(function(ee){
                        involved_facilities.push(ee);
                    });
                })

                involved_facilities = _.uniq(involved_facilities);

                buildSidepanelList(involved_facilities);

                d3.selectAll(id + ' .node').style('opacity',0.1);

                d3.selectAll(id + ' .link').each(function(l) {
                    // console.log(l);
                    if (l.source.id == d.id || l.target.id == d.id) {
                        d3.select(this).style('opacity', 1);
                        d3.selectAll(id + ' .node').each(function(n) {
                            if ( n.id == l.target.id || n.id == l.source.id) {
                                if (n.id != d.id) {
                                    d3.select(this).style('opacity', 1);
                                }
                            }
                        });
                    } else {
                        d3.select(this).style('opacity', 0.05);
                    }
                });
                d3.select(this).style('opacity', 1);

            });

        // Apply the general update pattern to the links.
        link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
        link.exit().remove();
        link = link.enter().append("path")
            .classed('link', true)
            .merge(link)
            .style('stroke-width', function(d) { return edgeWeight(d.weight) })
            .style('cursor', 'pointer')
            .style('opacity', function(d){
                if (canton != undefined) {
                    if (d.sourceName == canton || d.targetName == canton) {
                        d3.selectAll(id + ' .node').each(function(n) {
                            if ( n.id == d.targetName || n.id == d.sourceName) {
                                if (n.id != canton) {
                                    d3.select(this).style('opacity', 1);
                                }
                            }
                        });
                        return 1;
                    } else {
                        return 0.05;
                    }
                } else {
                    return 0.5;
                }
            })
            // .attr('marker-end', 'url(#arrowhead)')
            .on('click', function(d) {
                // console.log(d);
                buildSidepanelList(d.target_institutions);
            });

        // Apply general update pattern to labels
        label = label.data(nodes, function(d) { return d.id; });
        label.exit().remove();
        label = label.enter()
            .append("text")
            .classed('label', true)
            .text(function(d) { return d.label; })
            .merge(label);

        // Update and restart the simulation.
        simulation.nodes(nodes);
        // simulation.force("r").radius(height * .45)
        simulation.force("link").links(links);
        // simulation.force("collision").radius(function(d){ return radius(d.count) + 1 });

        simulation
            .alpha(1)
            .on("tick", ticked)
            .restart();

        function ticked() {
            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            link.attr('stroke', function(d) {
                    if (d.source.concordat == d.target.concordat) {
                        return '#ccc';
                    } else {
                        return color(d.source.concordat);
                    }
                })
                .attr("d", function(d) {
                    return linkArc(d);
                })

            label.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
        }

        // Draw curved edges, create d-value for link path
        function linkArc(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy); //Pythagoras!
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        }

    } // draw

} // all
