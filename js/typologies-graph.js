function TypologiesGraph(id, data) {

    this.id = id;

    let svg,
        width,
        height,
        nodes,
        links,
        simulation,
        g,
        link,
        node,
        label;

    if (!this.svg) {
        // check if svg has been craeted, if not runs init()
        svg = this.svg = d3.select(this.id).append('svg');
    }

    // intialise containers of the graph
    g = svg.append("g");
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
        .force("charge", d3.forceManyBody().strength(-500))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("collision", null)
        // .force("center", d3.forceCenter())
        .alphaDecay(.02)
        .on("tick", null);

    let radius = d3.scaleLinear()
        .range([5, 40])
        .domain([1, 306]);

    let weight = d3.scaleLinear()
        .range([0,.25])
        .domain([0,9])

    let tickness = d3.scaleLinear()
        .range([1,9])
        .domain([1,9])

    this.draw = function(year) {

        width = d3.select(this.id)
            .node()
            .offsetWidth - 30;

        height = width * .6;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        svg.attr('width', width)
            .attr('height', height);

        g.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let thisData;
        if (year) {
            thisData = data[year];
        } else {
            thisData = data[1933];
        }

        nodes = thisData.nodes;
        links = thisData.edges;

        // Apply general update pattern to nodes
        node = node.data(nodes, function(d) { return d.id; });
        node.exit().remove();
        node = node.enter()
            .append("circle")
            .classed('node', true)
            .attr("r", function(d) { return radius(d.count) })
            .on('click', function(d){
                console.log(d);
            })
            .merge(node);

        // Apply the general update pattern to the links.
        link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
        link.exit().remove();
        link = link.enter()
            .append("line")
            .style('stroke-width', function(d){ return tickness(d.weight); })
            .classed('link', true)
            .merge(link);

        // Apply general update pattern to labels
        label = label.data(nodes, function(d) { return d.id; });
        label.exit().remove();
        label = label.enter()
            .append("text")
            .classed('label', true)
            .text(function(d){ return d.label; })
            .merge(label);

        // Update and restart the simulation.
        simulation.nodes(nodes);
        simulation.force("link").links(links).strength(function(d){ return weight(d.weight); });
        // simulation.force("collision").radius(function(d){ return radius(d.count) + 1 });

        simulation
            .alpha(1)
            .on("tick", ticked)
            .restart();

        function ticked() {
            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            label.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
        }
    } // draw

} // all