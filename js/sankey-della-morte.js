function SurviesSankey(id, data) {

    this.id = id;

    let svg,
        width,
        height,
        margin = {left:5,right:5,top:0,bottom: 0},
        nodesWidth = 15,
        nodesPadding,
        transitionDuration = 0;

    if (d3.select(id + ' svg').empty()) {
        // check if svg has been craeted, if not runs init()
        svg = this.svg = d3.select(this.id).append('svg');
    } else {
        svg = this.svg = d3.select(id + ' svg')
    }

    // console.log(data)

    this.draw = function(model) {

        width = d3.select(this.id).node().offsetWidth - 0;

        if (model == 'mosaic') {
            nodesPadding = 5;
        } else {
            nodesPadding = width * 0.05;
        }

        height = width * .5;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }

        svg.attr('width', width)
            .attr('height', height)
        // .style('border', '1px solid orange');

        // force the SVG to be empty since we are re-drawing the chart on the window resize
        svg.selectAll('*').remove();


        // Scales and utilities
        let formatNumber = d3.format(",.0f"),
            format = function(d) { return formatNumber(d); };

        let years = d3.nest()
            .key(function(d) { return d.group; })
            .entries(data.nodes).map(function(d) { return d.key * 1 })

        let nodesPosition = d3.scaleLinear()
            .range([margin.left, width - nodesWidth - margin.right])
            .domain([1933, 1980])

        let categories = d3.nest()
            .key(function(d) { return d.name; })
            .entries(data.nodes).map(function(d) { return d.key })

        let mosaicPosition = d3.scaleBand()
            .rangeRound([width / 5, width])
            .rangeRound([0, width])
            .paddingInner(.07)
            .domain(years)

        let nodesColor = d3.scaleOrdinal()
            .range(['#E7EDEF', '#F89C74', '#F6CF71', '#89C2DA'])
            // .range(['#E7EDEF', '#EF9D79', '#E9C670', '#89C2DA']), '#66C5CC'
            .domain(categories);

        let legendItems = d3.select(id + ' .legend').selectAll('span');

        legendItems = legendItems.data(nodesColor.domain(), function(d) { return d })

        legendItems.exit().remove();

        legendItems = legendItems.enter()
            .append('span')
            .merge(legendItems)
            .html(function(d){
                let innerHtml = '<span class="color-square" style="background-color: '+ nodesColor(d) +';"></span> '+ d.replace('1_','').replace('2_','').replace('3_','').replace('4_','');
                return innerHtml;
            })


        .enter()
            .append()

        // Gradients
        let gradients = []
        categories.forEach(function(d) {
            categories.forEach(function(e) {
                if (d != e || true) {
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
            let thisGradients = this;
            Object.keys(d).forEach(function(e) {
                let thisValues = d[e];
                d3.select(thisGradients).append('stop')
                    .attr('offset', thisValues.offset + '%')
                    .style('stop-color', thisValues.color)
                    .style('stop-opacity', thisValues.opacity)
            })
        })

        // Draw years labels

        let yearsLabels = svg.append('g').classed('years', true).selectAll('label');

        yearsLabels = yearsLabels
            .data(years)
            .enter()
            .append('text')
            .classed('label', true)
            .classed('year-label', true)
            .attr('x', function(d) { return nodesPosition(d) + nodesWidth/2 })
            .attr('y', '1rem')
            .attr('text-anchor', 'middle')
            .text(function(d) {
                if (d == 1940) {
                    return '1940\'s';
                } else {
                    return d;
                }
            })
            // .filter(function(d) { return nodesPosition(d) > width / 2 })
            // .attr('x', function(d) { return nodesPosition(d) + 15 })
            // .attr('text-anchor', 'end')



        // Draw the sankey
        let sankeyGroup = svg.append('g').classed('sankey-group', true);
        let sankey = d3.sankey()
            .nodeWidth(nodesWidth)
            .nodePadding(nodesPadding)
            .extent([
                [margin.left, 30],
                [width-margin.right, height-margin.bottom]
            ])
            .iterations(0); // this forces the layout to keep the original nodes order in the dataset

        let link = sankeyGroup.append("g")
            .attr("class", "links")
            .selectAll("path");

        let node = sankeyGroup.append("g")
            .attr("class", "nodes")
            .selectAll("g");

        sankey(data);

        // Remap nodes position in order to have a realistic temporal dimention on the horizontal axis
        // This happens after the data binding with the sankey layout: "sankey(data)"
        data.nodes.forEach(function(d) {
            d.x0 = nodesPosition(+d.group);
            d.x1 = d.x0 + nodesWidth;
        })

        // Sort the links so to always have the smallest links in the foreground and the biggest in the background
        data.links = data.links.sort(function(a, b) {
            return b.value - a.value;
        })

        node = node
                .data(data.nodes)
            .enter()
                .append("g")
                .on('click',function(d){
                    console.log(d)
                });

        node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .style("fill", function(d) { return nodesColor(d.name); })
            .style("stroke", function(d) {
                // console.log(d)
                if (d.name == "1_uncertain") {
                    return d3.color(nodesColor(d.name)).darker(1);
                } else {
                    return 'none';
                }
            });

        node.append("text")
            .classed('label', true)
            // .style('opacity', function(d,i){
            //     if (i < 4) {
            //         return 1;
            //     } else {
            //         return 0;
            //     }
            // })
            .attr("x", function(d) { return d.x0 - 6; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(function(d) {
                // console.log(d);
                return d.value;
            })
            .filter(function(d) { return d.x0 < width / 2; })
            .attr("x", function(d) { return d.x1 + 6; })
            .attr("text-anchor", "start");

        node.append("title")
            .text(function(d) { return d.name + "\n" + format(d.value); });

        link = link
            .data(data.links)
            .enter().append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) { return Math.max(2, d.width); })
            .attr("stroke", function(d) {
                if (d.source.name == d.target.name) {
                    return nodesColor(d.source.name)
                } else {
                    return 'url(#' + d.source.name.split(' ').join('_') + '-' + d.target.name.split(' ').join('_') + ')'
                }
            })
            .on('click', function(d) {
                console.log(d)
            });

        link.append("title")
            .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });


        // Toggle between mosaic and sankey
        if (model == 'mosaic') {

            d3.selectAll('.year-label')
                .attr('x', function(d) { return nodesPosition(d) + nodesWidth/2 })
                .transition()
                .duration(transitionDuration)
                .attr('x', function(d) { return mosaicPosition(d) + mosaicPosition.bandwidth() * .5 })

            d3.selectAll('.nodes rect')
                .attr('x', function(d) { return d.x0 })
                .attr('width', function(d) { return d.x1 - d.x0; })
                .transition()
                .duration(transitionDuration)
                .attr('x', function(d) { return mosaicPosition(d.group) })
                .attr('width', mosaicPosition.bandwidth())

            d3.selectAll('.nodes text')
                // .filter(function(d, i) { return i > 3 })
                .style('opacity', 1)
                .transition()
                .delay(0)
                .duration(transitionDuration * .5)
                .style('opacity', 0);

            link.style('opacity', .3)
                .style('pointer-events','auto')
                .transition()
                .delay(0)
                .duration(transitionDuration * .5)
                .style('opacity', 0)
                .style('pointer-events','none');

        } else if (model == 'sankey') {

            d3.selectAll('.year-label')
                .attr('x', function(d) { return mosaicPosition(d) + mosaicPosition.bandwidth() * .5 })
                .transition()
                .duration(transitionDuration)
                .attr('x', function(d) { return nodesPosition(d) + nodesWidth/2 })

            d3.selectAll('.nodes rect')
                .attr('x', function(d) { return mosaicPosition(d.group) })
                .attr('width', mosaicPosition.bandwidth())
                .transition()
                .duration(transitionDuration)
                .attr('x', function(d) { return d.x0 })
                .attr('width', function(d) { return d.x1 - d.x0; });

            d3.selectAll('.nodes text')
                // .filter(function(d, i) { return i > 3 })
                .style('opacity', 0)
                .transition()
                .delay(transitionDuration * 0.5)
                .duration(transitionDuration * .5)
                .style('opacity', 1);

            link.style('opacity', 0)
                .style('pointer-events','none')
                .transition()
                .delay(transitionDuration * 0.5)
                .duration(transitionDuration * .5)
                .style('opacity', .3)
                .style('pointer-events','auto');

        }

        transitionDuration =1000;

    } // draw

} // all
