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
        groupsNames,
        legendItem,
        years,
        years_list = [1933, 1940, 1954, 1965, 1980],
        index,
        color,
        radius,
        fixedRadius = 5;

    let functionDraw;

    // Greens
    // #d3f2a3,#97e196,#6cc08b,#4c9b82,#217a79,#105965,#074050

    // scale for grous, not used anymore
    color = d3.scaleOrdinal()
        .range(['#d3f2a3', '#6cc08b', '#217a79', '#074050'])
        .domain([1, 2, 3, 4]);

    let areas = [5, 10, 20, 50, 100, 150, 200]
    let radiusses = [];
    areas.forEach(function(d) {
        d *= 5;
        let thisRadius = Math.sqrt(d / (Math.PI * 2));
        radiusses.push(thisRadius);
    })

    radius = d3.scaleOrdinal()
        .range(radiusses)
        .domain(["not specified", "0 - 19", "20 - 49", "50 - 99", "100 - 149", "150 - 199", "200 - over"])

    let dataLegend = ['Capacities'].concat(radius.domain())

    let capacityColor = d3.scaleOrdinal()
        .domain(["not specified", "0 - 19", "20 - 49", "50 - 99", "100 - 149", "150 - 199", "200 - over"])
        // red
        .range(['#ffffff', '#fae6c4', '#f0b8a3', '#e38984', '#c5626c', '#99445b', '#70284a'])
        // green
        .range(['#ffffff', '#074050', '#217a79', '#4c9b82', '#6cc08b', '#97e196', '#d3f2a3'])
        //yellow
        .range(['#ffffff', '#DCC274', '#CFB76D', '#B5A060', '#8F7F4B', '#4F462A', '#38321E'])
        .range(['#ffffff', '#38321E', '#4F462A', '#8F7F4B', '#B5A060', '#CFB76D', '#DCC274']);

    // #d3f23,#97e196,#6cc08b,#4c9b82,#217a79,#105965,#074050

    let legendPosition = d3.scaleLinear()

    let yearsPosition = d3.scaleLinear()

    this.id = id;

    if (data) {
        data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
    }

    // let theData = data;

    this.init = function() {
        this.svg = d3.select(this.id)
            .append('svg')
            .attr('id', 'multiporpuses-viz-b');

        legendItem = this.svg.append("g")
            .attr('class', 'legend')
            .selectAll('.item');

        // years = this.svg.append("g")
        //     .attr('class', 'years-switcher')
        //     .selectAll('.year');
        //
        // years = years.data(years_list);
        //
        // years.exit()
        //     .remove();
        //
        // years = years.enter()
        //     .append('text')
        //     .classed('label year', true)
        //     .styles({
        //         'pointer-events': 'all',
        //         'text-anchor': 'middle',
        //         'text-decoration': 'underline'
        //     })
        //     .attr('x', 0)
        //     .attr('y', 500)
        //     .text(function(d) {
        //         if (d == '1940') {
        //             return "1940's";
        //         } else {
        //             return d
        //         }
        //     })
        //     .style('text-transform', function(d) {
        //         if (d == '1940') {
        //             return 'none';
        //         }
        //     })
        //     .on('click', function(d) {
        //         index = years_list.indexOf(d);
        //         return bubblechart.draw(d)
        //
        //     })
        //     .merge(years);

        g = this.svg.append("g");

        node = g.append("g")
            .attr('class', 'node-container')
            .selectAll(".node");

        label = g.append("g")
            .attr('class', 'label-container')
            .selectAll(".label");

        groupsNames = g.append('g')
            .attr('class', 'groups-names-container')
            .selectAll('text')

        svg = this.svg;
    }

    nodes = [];
    links = [];

    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody()
            .strength(-5))
        .force("y", d3.forceY()
            .strength(0.2))
        .alphaDecay(.1)
        .on("tick", null);

    functionDraw = this.draw;

    this.draw = function(year) {

        let thisDraw = this.draw;

        // check if svg has been craeted, if not runs init()
        if (!this.svg) {
            this.init();
        }
        // this.svg.style('border', '1px solid blue');
        let partentWidth = d3.select(this.id)
            .node()
            .offsetWidth - 30;

        width = partentWidth;
        // let marginLeft = (window.innerWidth - partentWidth)/-2 - 15

        height = width * .25;
        if (height < 400) { height = 400 }
        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        this.svg.attr('width', width)
            .attr('height', height);

        let subchapterWidth = $('#temporal-framing').width();

        if (subchapterWidth > 960) {
            legendPosition.range([width / 6 + 15, width - width / 6 - 15]);
        } else if (subchapterWidth > 720) {
            legendPosition.range([width / 12 + 15, width - width / 12 - 15]);
        } else {
            legendPosition.range([width / 25 + 15, width - width / 25 - 15]);
        }

        legendPosition.domain([0, 8]);

        g.attr("transform", "translate(" + width / 2 + "," + (height / 2 - 20) + ")");

        // d3.selectAll('.selected-year').remove();
        //
        // this.svg.append('text')
        // .classed('label selected-year',true)
        // .styles({
        //     'text-anchor': 'middle',
        //     'color':'#4a4a4a'
        // })
        // .attr('x', width/2)
        // .attr('y',height)
        // .text('Selected year')

        if (year) {
            // console.log(year)
            update(data, year);
        } else {
            index = 2;
            update(data, years_list[index])
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
                        return capacityColor(d.capacity_group);
                    }
                })
                .attr('data-toggle', 'tooltip')
                .attr('data-placement', 'top')
                .attr('data-html', 'true')
                .attr('title', function(d){
                    let thisRecord = masterData.filter(function(e){
                        return e.id == d.id;
                    })[0]
                    let name_landmark = thisRecord.name_landmark;
                    let city = thisRecord.city;
                    let canton_code = thisRecord.canton_code;
                    return `<div class="viz-tooltip"><span>${name_landmark}</span><br/><span>${city}, ${canton_code}</span></div>`;
                })
                // .on('mouseenter', function(d) {
                //     svg.selectAll('.label')
                //         .filter(function(e) { return e.id == d.id })
                //         .classed('hidden', false);
                // })
                // .on("mouseleave", function(d) {
                //     svg.selectAll('.label')
                //         .filter(function(e) {
                //             console.log(e);
                //             console.log(d);
                //             return e.id == d.id })
                //         .classed('hidden', true);
                // })
                .on("click", function(d) {
                    let activeYear = $('#bubblechart .active-year').attr('data-id');
                    buildSidepanel(d.id, activeYear);
                });

            node.transition()
                .duration(500)
                .delay(function(d, i) { return i * 2 })
                .attr('r', function(d) {
                    // return fixedRadius;
                    return radius(d.capacity_group);
                })

            // Apply the general update pattern to the label.
            // label = label.data(nodes, function(d) { return d.id; });
            // label.exit()
            //     .remove();
            // label = label.enter()
            //     .append("text")
            //     .classed('label', true)
            //     .classed('hidden', true)
            //     .style('text-anchor', 'middle')
            //     .html(function(d) { return masterData.filter(function(e){ return d.id == e.id })[0].name_landmark })
            //     .merge(label);

            let nodesGroups = d3.nest()
                .key(function(d) { return d.group; })
                .entries(nodes)
                .map(function(d) {
                    return d.key
                })

            groupsNames = groupsNames.data(nodesGroups);

            groupsNames.exit()
                .remove();

            groupsNames = groupsNames.enter()
                .append('text')
                .classed('label', true)
                .merge(groupsNames)
                .attr('x', function(d) {
                    let thisx = -width * .5 + (width / (nodesGroups.length + 1)) * d * 1.1;
                    return thisx;
                })
                .attr('y', 160)
                .style('text-anchor', 'middle')
                .style('opacity', 0)
                .text(function(d) {
                    let thisName;
                    switch (d) {
                        case '1':
                            thisName = 'Single purpose';
                            break;
                        case '2':
                            thisName = 'Two purposes';
                            break;
                        case '3':
                            thisName = 'Three purposes';
                            break;
                        default:
                            thisName = 'Four purposes';
                    }
                    return thisName;
                })

            groupsNames.transition()
                .duration(1500)
                .style('opacity', 1);

            // Update and restart the simulation.
            simulation.force("collide", d3.forceCollide(function(d) {
                    // return fixedRadius;
                    return radius(d.capacity_group) + 2
                })
                .iterations(16))

            simulation.alpha(1)
                .nodes(nodes)
                .force("x", d3.forceX(function(d) {
                        let thisx = -width * .5 + (width / (nodesGroups.length + 1)) * d.group * 1.1;
                        return thisx;
                    })
                    .strength(0.2))
                .on("tick", ticked)
                .restart();
        } // update

        function ticked() {
            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            // label.attr("x", function(d) { return d.x; })
            //     .attr("y", function(d) { return d.y; });
        }

        legendItem = legendItem.data(dataLegend, function(d) { return d });

        legendItem.exit()
            .remove();

        legendItem = legendItem.enter()
            .append('g')
            .classed('item', true)
            .merge(legendItem)
            .attr('transform', function(d, i) {
                return 'translate(' + legendPosition(i) + ',' + 22 + ')';
            })
            .on('mouseenter', function(d) {
                d3.selectAll(id + ' .node')
                    .filter(function(e) {
                        return e.capacity_group != d
                    })
                    .transition()
                    .duration(750)
                    .style('opacity', .1)
            })
            .on('mouseleave', function(d) {
                d3.selectAll(id + ' .node')
                    .transition()
                    .duration(750)
                    .style('opacity', 1)
            });

        legendItem.selectAll('*')
            .remove();

        legendItem.append('circle')
            .attr('fill', function(d, i) {
                if (i == 0) {
                    return 'none';
                } else {
                    return capacityColor(d);
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
            .attr('cx', 0)
            .attr('cy', 0)

        legendItem.append('text')
            .classed('label', true)
            .attr('y', 3.5)
            .attr('x', function(d){
                return radius(d) + 3
            })
            .text(function(d) { return d })

        // d3.selectAll('.year')
        //     .attr('y', height - 14)
        //     .classed('selected', function(d, i) {
        //         return i == index ? true : false;
        //     })
        //     .transition()
        //     .duration(750)
        //     .attr('x', function(d, i) {
        //         if (i == index) {
        //             return width / 2;
        //         } else {
        //             if (i < index) {
        //                 return width / 6 + 15 + 40 * i;
        //             } else {
        //                 return (width - width / 6) - 15 - 40 * (years_list.length - i + 1);
        //             }
        //         }
        //     });
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })

    } //draw

}
