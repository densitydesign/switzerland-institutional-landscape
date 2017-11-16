function SurviesSankey(id, data) {

    this.id = id;

    let svg,
        width,
        height;

    if (!this.svg) {
        // check if svg has been craeted, if not runs init()
        svg = this.svg = d3.select(this.id).append('svg');
    }

    console.log(data)

    this.draw = function() {


        width = d3.select(this.id).node().offsetWidth - 30;

        height = width * .4;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }

        svg.attr('width', width)
            .attr('height', height)
            // .style('border', '1px solid orange');



        var formatNumber = d3.format(",.0f"),
            format = function(d) { return formatNumber(d) + " TWh"; },
            color = d3.scaleOrdinal()
                    .range(['#999','#F89C74','#F6CF71','#66C5CC'])
                    .domain(['1_uncertain','2_closed', '3_open but not surveyed', '4_open and surveyed']);

        var sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(15)
            .extent([
                [0, 0],
                [width, height]
            ])
            .iterations(0); // this forces the layout to keep the original nodes order in the dataset

        svg.selectAll('*').remove();

        var link = svg.append("g")
            .attr("class", "links")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.2)
            .selectAll("path");

        var node = svg.append("g")
            .attr("class", "nodes")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .selectAll("g");

        sankey(data);

        console.log(data.nodes)

        node = node
            .data(data.nodes)
            .enter().append("g");

        node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .attr("fill", function(d) { return color(d.name); });

        node.append("text")
            .attr("x", function(d) { return d.x0 - 6; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x0 < width / 2; })
            .attr("x", function(d) { return d.x1 + 6; })
            .attr("text-anchor", "start");

        node.append("title")
            .text(function(d) { return d.name + "\n" + format(d.value); });

        link = link
            .data(data.links)
            .enter().append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) { return Math.max(1, d.width); });

        link.append("title")
            .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });


    } // draw

} // all