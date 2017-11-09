function Bubblechart(id, data) {

    this.id = id;

    if (data) {
        this.data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        // console.table(this.data)
    }

    let g, link, node, label, 
    		color = d3.scaleOrdinal(d3.schemeCategory10),
    		radius = d3.scaleOrdinal()
    				.range([2,1.78412*2.5,2.52313*2.5,3.98942*2.5,5.6419*2.5,6.9098829894267*2.5,7.9788456080287*2.5])
    				.domain(['not specified','0 - 19','20 - 49','50 - 99','100 - 149','150 - 199', '200 - over']);

    this.init = function() {
        this.svg = d3.select(this.id).append('svg');
        g = this.svg.append("g");
        link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link");
        node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");
        label = g.append("g").attr("fill", "#333").selectAll(".label");
    }

    let nodes,
        links,
        simulation;

    nodes = [];
    links = [];

    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-10))
        .force("collide", d3.forceManyBody().strength(-10))
        .force("link", d3.forceLink(links).distance(200))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaDecay(.1)
        .on("tick", null);

    this.draw = function(year) {

        // check if svg has been craeted, if not runs init()
        if (!this.svg) {
            this.init();
        }
        // this.svg.style('border', '1px solid blue');
        this.width = d3.select(this.id).node().offsetWidth - 30;
        this.height = this.width * .75;
        this.svg.attr('width', this.width).attr('height', this.height);

        g.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

        if (year) {
            update(this.data, year);
        } else {
            update(this.data, 1933);
        }

        function update(data, selectedYear) {

            nodes = data.filter(function(d) { return d.key == selectedYear })[0].values

            // Apply the general update pattern to the nodes.
            node = node.data(nodes, function(d) { return d.id; });

            node.exit()
            		.transition()
            			.duration(500)
            			// .delay(function(d,i){ return i })
            			.attr('r',0)
            			.remove();

            node = node.enter().append("circle")
            		.classed('node',true)
                .attr("fill", function(d) { 
                	if (d.capacity_group == 'not specified') {
                		return '#fff'
                	} else {
                		return color(d.group);
                	}
                })
                .attr("stroke", function(d) { 
                	if (d.capacity_group == 'not specified') {
                		return color(d.group)
                	}
                })
                .attr("r", 0)
                .attr("data-id", function(d){ return d.id })
                .merge(node);

            node.transition()
                	.duration(500)
                	.delay(function(d,i){ return i*3 })
                	.attr('r', function(d){ return radius(d.capacity_group); })

            // Apply the general update pattern to the label.
            label = label.data(nodes, function(d) { return d.id; });
            label.exit().remove();
            label = label.enter().append("text")
            		.classed('label',true)
            		.attr('opacity',0)
            		.attr('text-anchor','middle')
            		.attr('font-size', '0.4rem')
                .html(function(d){ return d.id })
                .merge(label);

            // Apply the general update pattern to the links.
            link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
            link.exit().remove();
            link = link.enter().append("line").merge(link);

            // Update and restart the simulation.
            simulation.nodes(nodes);
            simulation.force("collide", d3.forceCollide( function(d){return radius(d.capacity_group) + 2 }).iterations(16))
            simulation.force("link").links(links);
            simulation.alpha(1).on("tick", ticked).restart();
        }

        function ticked() {
            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            label.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });

            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        }



    } //draw

}