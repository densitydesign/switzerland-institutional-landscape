function Bubblechart(id, data) {

    let svg,
        width,
        height,
        nodes,
        links,
        simulation,
        g,
        link,
        node,
        label,
        color,
        radius;

    // #d3f2a3,#97e196,#6cc08b,#4c9b82,#217a79,#105965,#074050

    color = d3.scaleOrdinal()
        .range(['#d3f2a3', '#6cc08b', '#217a79', '#074050'])
        .domain([1, 2, 3, 4])

    radius = d3.scaleOrdinal()
        .range([2, 4, 6, 8, 10, 12, 14])
        .domain(["not specified", "0 - 19", "20 - 49", "50 - 99", "100 - 149", "150 - 199", "200 - over"])

    this.id = id;

    if (data) {
        data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
    }


    // let theData = data;

    this.init = function() {
        this.svg = d3.select(this.id).append('svg');

        g = this.svg.append("g");
        node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll(".node");
        label = g.append("g")
            .attr("fill", "#333")
            .selectAll(".label");

        svg = this.svg;
    }

    nodes = [];
    links = [];

    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-8))
        .force("y", d3.forceY().strength(0.2))
        .alphaDecay(.01)
        .on("tick", null);

    this.draw = function(year) {

        // check if svg has been craeted, if not runs init()
        if (!this.svg) {
            this.init();
        }
        // this.svg.style('border', '1px solid blue');
        width = d3.select(this.id)
            .node()
            .offsetWidth - 30;

        height = width * .6;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        this.svg.attr('width', width)
            .attr('height', height);

        g.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        if (year) {
            // console.log(year)
            update(data, year);
        } else {
            var years_list = [1933, 1940, 1954, 1965, 1980];
            var index = 0;
            update(data, years_list[index]);
            index++;
        }



        function update(data, selectedYear) {

            nodes = data.filter(function(d) { return d.key == selectedYear })[0].values

            // Apply the general update pattern to the nodes.
            node = node.data(nodes, function(d) { return d.id; });

            node.exit()
                .transition()
                .duration(500)
                .attr('r', 0)
                .remove();

            node = node.enter()
                .append("circle")
                .classed('node', true)
                .attr("r", 0)
                .merge(node)
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", function(d) {
                    if (d.capacity_group == "not specified") {
                        return '#fff'
                    } else {
                        return color(d.group);
                    }
                })
                .on('mouseenter', function(d) {
                    svg.selectAll('.label').filter(function(e) { return e.id == d.id }).classed('hidden', false);
                })
                .on("mouseleave", function(d) {
                    svg.selectAll('.label').filter(function(e) { return e.id == d.id }).classed('hidden', true);
                })
                .on("click", function(d) {
                    console.log( masterData.filter(function(e){ return d.id == e.id }) );
                });

            node.transition()
                .duration(500)
                .delay(function(d, i) { return i * 2 })
                .attr('r', function(d) { return radius(d.capacity_group); })

            // Apply the general update pattern to the label.
            label = label.data(nodes, function(d) { return d.id; });
            label.exit()
                .remove();
            label = label.enter()
                .append("text")
                .classed('label', true)
                .classed('hidden', true)
                .style('text-anchor', 'middle')
                .html(function(d) { return masterData.filter(function(e){ return d.id == e.id })[0].name_landmark })
                .merge(label);

            // Update and restart the simulation.
            simulation.force("collide", d3.forceCollide(function(d) { return radius(d.capacity_group) + 2 }).iterations(16))

            let nodesGroups = d3.nest()
                .key(function(d) { return d.group; })
                .entries(nodes).map(function(d) {
                    return d.key
                })

            simulation.alpha(1).nodes(nodes)
                .force("x", d3.forceX(function(d) {
                    return width / (nodesGroups.length + 2) * (d.group + 1) - width / 2 - width / (nodesGroups.length + 2) * .3;
                }).strength(0.2))
                .on("tick", ticked)
                .restart();
        }

        function ticked() {
            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            label.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
        }

        if (this.svg.select('.legend').empty()) {
            // console.log('Drawing legend for bubblechart');
            let legend = this.svg.append('g').attr('class', 'legend');

            let sizes = legend.append('g').attr('class', 'sizes')
            let itemSize = sizes.selectAll('.item')
                .data(radius.domain())
                .enter().append('g')
                .classed('item', true)
            itemSize.append('circle')
                .attr('fill', function(d, i) {
                    if (d == "not specified") {
                        return '#fff';
                    } else {
                        return '#074050';
                    }
                })
                .attr('stroke', function(d, i) {
                    if (d == "not specified") {
                        return '#074050';
                    } else {
                        return '';
                    }
                })
                .attr('r', function(d) { return radius(d) })
                .attr('cx', function(d, i) { return 40 - radius(d) })
                .attr('cy', function(d, i) {
                    let thisY = 30;
                    for (var e = 0; e < i; e++) {
                        thisY += radius(radius.domain()[e])*2;
                        thisY += 18;
                    }
                    return thisY;
                })
            itemSize.append('text')
                .classed('label', true)
                .attr('x', function(d, i) { return 45 })
                .attr('y', function(d, i) {
                    let thisY = 30;
                    for (var e = 0; e < i; e++) {
                        thisY += radius(radius.domain()[e])*2;
                        thisY += 18;
                    }
                    thisY += 3;
                    return thisY;
                })
                .text(function(d) { return d })

            let colors = legend.append('g').attr('class', 'colors')
            let colorItem = colors.selectAll('.item')
                .data(color.domain())
                .enter().append('g')
                .classed('item', true)
                .attr('transform', function(d, i) { return 'translate(' + 25 + ',' + (i * 20 + 300) + ')' })
            colorItem.append('rect')
                .attr('fill', function(d) { return color(d) })
                .attr('x', 0)
                .attr('y', -8)
                .attr('width', 15)
                .attr('height', 15)
            colorItem.append('text')
                .classed('label', true)
                .attr('x', 20)
                .attr('y', 3)
                .text(function(d) {
                    if (d == 1) {
                        return d + ' typology'
                    } else if (d == 2) {
                        return d + ' typologies'
                    } else if (d == 3) {
                        return d + ' typologies'
                    } else if (d == 4) {
                        return d + ' typologies'
                    }
                })



        } //update

    } //draw

}
