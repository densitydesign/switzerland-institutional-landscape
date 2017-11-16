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

        height = width * .5;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }

        svg.attr('width', width)
            .attr('height', height)
        // .style('border', '1px solid orange');

        // force the SVG to be empty since we are re-drawing the chart on the window resize
        svg.selectAll('*').remove();

        let categories = d3.nest()
                .key(function(d){
                    return d.name;
                })
                .entries(data.nodes).map(function(d){ return d.key})

        let formatNumber = d3.format(",.0f"),
            format = function(d) { return formatNumber(d) + " TWh"; };

        let nodesColor = d3.scaleOrdinal()
            .range(['#999', '#F89C74', '#F6CF71', '#66C5CC'])
            .domain(categories);

        // prepare links gradients
        let gradients = []

        categories.forEach(function(d) {
            categories.forEach(function(e) {
                if (d != e || true) {
                    // console.log(d + ' - ' + e);
                    // console.log(nodesColor(d) + ' - ' + nodesColor(e));
                    gradients.push({
                        '0%': {
                            'offset': 0,
                            'name': d,
                            'color': nodesColor(d),
                            'opacity': 1
                        },
                        '100%': {
                            'offset': 100,
                            'name': e,
                            'color': nodesColor(e),
                            'opacity': 1
                        }
                    });
                }
            })
        })

        let linearGradient = svg.append('defs').classed('gradients-group', true).selectAll('linearGradient');

        linearGradient = linearGradient
            .data(gradients)
            .enter()
            .append("linearGradient")
            .attr('id', function(d) {
                let thisId = '';
                Object.keys(d).forEach(function(e) {
                    thisId += d[e].name.split(' ').join('_') + '-';
                })
                thisId = thisId.slice(0, -1);
                return thisId;
            })
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%')

        d3.selectAll('.gradients-group linearGradient').each(function(d) {
            // console.log(this, d)
            let thisGradients = this;
            Object.keys(d).forEach(function(e) {
                // console.log(e)
                let thisValues = d[e];
                d3.select(thisGradients).append('stop')
                    .attr('offset', thisValues.offset + '%')
                    .style('stop-color', thisValues.color)
                    .style('stop-opacity', thisValues.opacity)
            })
            
        })




        let sankeyGroup = svg.append('g').classed('sankey-group', true);

        let sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(15)
            .extent([
                [0, 0],
                [width, height]
            ])
            .iterations(0); // this forces the layout to keep the original nodes order in the dataset

        let link = sankeyGroup.append("g")
            .attr("class", "links")
            .selectAll("path");

        let node = sankeyGroup.append("g")
            .attr("class", "nodes")
            .selectAll("g");

        sankey(data);

        node = node
            .data(data.nodes)
            .enter().append("g");

        node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .attr("fill", function(d) { return nodesColor(d.name); });

        node.append("text")
            .classed('label',true)
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
            .attr("stroke-width", function(d) { return Math.max(1, d.width); })
            .attr("stroke", function(d){

                if (d.source.name == d.target.name) {
                    return nodesColor(d.source.name)
                } else {
                    return 'url(#' + d.source.name.split(' ').join('_') + '-' + d.target.name.split(' ').join('_') + ')'
                }
                // return 'url(#3_open_but_not_surveyed-4_open_and_surveyed)';
                // return 'url(#' + d.source.name.split(' ').join('_') + '-' + d.target.name.split(' ').join('_') + ')';
            });

        link.append("title")
            .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });


    } // draw

} // all