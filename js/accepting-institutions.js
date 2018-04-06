//set variable outside the function to make it accessible globally
const navScroller = scrollama();

function AcceptingInstitutions(id, data, swiss) {

    this.id = id;

    let svg,
        nodes = [],
        mapData,
        fixedRadius = 4;

    if (!this.svg) {
        // check if svg has been craeted, if not runs init()
        svg = this.svg = d3.select(this.id).append('svg');
    }

    let projection = d3.geoMercator(),
        path = d3.geoPath().projection(projection);

    let resetRect = svg.append('rect'),
        cantonsBorders = svg.append('g').classed('cantons-map', true).selectAll('path'),
        node = svg.append("g").selectAll(".node"),
        nodeLabel = svg.append("g").selectAll(".nodeLabel");

    let cantonsLabels = d3.select('.cantons-map').selectAll('text')

    let simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(function(d) { return d.centerX }))
        .force("y", d3.forceY(function(d) { return d.centerY }))
        .force("collide", d3.forceCollide(function(d) { return fixedRadius + 0.5 }))
        // general force settings
        .alpha(1)
        .alphaDecay(0.01)
        .on("tick", null)

    let concordatColors = d3.scaleOrdinal()
        // .range(['#ca5268', '#85c4c9', '#97e196', '#888888'])
        // .range(['#CFB76D', '#79745C', '#B5BA72', '#EAE6DA'])
        .range(['#CFB76D', '#79745C', '#81aa91', '#EAE6DA'])
        .domain(['c1', 'c2', 'c3', 'not specified'])

    let notSpecifiedLabels = d3.scaleOrdinal()
        .domain(['XX1', 'XX2', 'XX3', 'XX4'])
        .range(['Other', 'Region-Nordwest-Innerschweiz', 'Region-Ostschweiz', "Choix-de-l'établissement-ou-de-l'home-selon-le-cas"])

    this.draw = function(config, canton) {

        let thisData = null;

        if (config.year) {
            thisData = data[config.year];
        } else {
            thisData = data[1954];
        }

        width = d3.select(this.id)
            .node()
            .offsetWidth - 60;

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
                d3.select('.selected-canton span')
                    .transition()
                    .duration(300)
                    .style('opacity', 0.5)
                    .text('click on a canton');

                reset();
            })

        // transform topojson to geojson
        let cantons = topojson.feature(swiss, swiss.objects.cantons);

        if (config.year < 1980) {
            var union = turf.union(cantons.features[1], cantons.features[25]);
            cantons.features[1] = union;
            cantons.features.pop();
        }

        // adapt map to viewport
        projection.fitSize([width, height - 10], cantons);

        // project map, responsive
        cantonsBorders = cantonsBorders.data(cantons.features);

        cantonsBorders.exit().remove();

        cantonsBorders = cantonsBorders.enter()
            .append('path')
            .classed('canton-contour', true)
            .style('fill', function(d) {
                let thisConcordat = thisData.nodes.filter(function(e) {
                    return e.id == d.properties.abbr;
                })
                if (thisConcordat.length > 0) {
                    thisConcordat = thisConcordat[0].concordat;
                } else {
                    thisConcordat = 'not specified';
                }
                d.properties.concordat = thisConcordat;
                return d3.color(concordatColors(d.properties.concordat));
            })
            .style('stroke', function(d) {
                return d3.color(concordatColors(d.properties.concordat)).darker(.75);
            })
            .merge(cantonsBorders)
            .on("click", function(d) {

                let thisCanton = d;

                let thisCantonCode = thisCanton.properties.abbr;
                let sending = [];
                let receiving = [];
                let exchanges = [];
                let viz_message;
                let target_institutions = [];

                let selected_canton = thisCanton.properties.name;

                let canton_selection = d3.select('.selected-canton span')
                    .style('opacity', 1e-6)
                    .text(function(d) {
                        return selected_canton;
                    });

                canton_selection.transition()
                    .duration(300)
                    .style('opacity', 1);

                if (config.direction == 'from') {

                    sending.push(thisCanton.properties.abbr);

                    let dataSelection = d3.nest()
                        .key(function(e) { return e.sourceName })
                        .entries(thisData.edges);

                    dataSelection = dataSelection.filter(function(e) {
                        return e.key == thisCanton.properties.abbr;
                    })

                    if (dataSelection.length > 0) {
                        dataSelection = dataSelection[0].values;

                        receiving = dataSelection.map(function(e) {
                            return e.targetName;
                        })

                        exchanges = dataSelection.map(function(e) {
                            return {
                                'source': e.sourceName,
                                'target': e.targetName,
                                'target_institutions': e.target_institutions
                            }
                        })
                    } else {
                        viz_message = thisCanton.properties.name + ' did not send detainees to other cantons in ' + config.year + '.';
                    }

                    target_institutions = masterData.filter(function(f) {
                        return thisCantonCode == f.canton_code;
                    })

                    target_institutions = target_institutions.filter(function(f) {
                        return f.survey_year == config.year;
                    })

                    target_institutions.forEach(function(e) {
                        e.overSelectedCanton = true;
                    })

                } else {

                    receiving.push(thisCanton.properties.abbr);

                    let dataSelection = d3.nest()
                        .key(function(e) { return e.targetName })
                        .entries(thisData.edges);

                    dataSelection = dataSelection.filter(function(e) {
                        return e.key == thisCanton.properties.abbr;
                    })

                    if (dataSelection.length > 0) {
                        dataSelection = dataSelection[0].values;

                        sending = dataSelection.map(function(e) {
                            return e.sourceName;
                        })

                        exchanges = dataSelection.map(function(e) {
                            return {
                                'source': e.sourceName,
                                'target': e.targetName,
                                'target_institutions': e.target_institutions
                            }
                        })
                    } else {
                        viz_message = thisCanton.properties.name + ' did not received detainees from other cantons in ' + config.year + '.';
                    }

                }

                let target_institutions_ids = [];
                exchanges.forEach(function(e) {
                    target_institutions_ids = target_institutions_ids.concat(e.target_institutions);
                })

                target_institutions_ids = _.uniq(target_institutions_ids);

                target_institutions_ids.forEach(function(e) {
                    let correspondingId = masterData.filter(function(f) {
                        return e == f.id
                    })
                    correspondingId[0].overSelectedCanton = false;
                    target_institutions.push(correspondingId[0]);
                })

                target_institutions.forEach(function(e) {
                    e.centerX = projection([e.longitude, e.latitude])[0];
                    e.centerY = projection([e.longitude, e.latitude])[1];
                    e.x = e.centerX;
                    e.y = e.centerY;
                })

                let receivingNotPlottable = exchanges.filter(function(e) {
                    return e.target == 'XX1' || e.target == 'XX2' || e.target == 'XX3' || e.target == 'XX4';
                })

                if (receivingNotPlottable.length > 0) {
                    receivingNotPlottable.forEach(function(f) {
                        target_institutions.push({
                            "accepted_gender": "not specified",
                            "canton": "not specified",
                            "canton_code": "SG",
                            "capacity": "",
                            "capacity_group": "not specified",
                            "centerX": width - 100,
                            "centerY": 100,
                            "city": "not specified",
                            "closed": "not specified",
                            "committing_agencies": "not specified",
                            "confession": "not specified",
                            "funding_agency": "not specified",
                            "id": f.target,
                            "index": null,
                            "institution": "not specified",
                            "name_landmark": notSpecifiedLabels(f.target),
                            "opened": "not specified",
                            "typologies": "not specified",
                            "x": width - (width / 5),
                            "y": height / 5
                        })
                    })
                }

                reset();

                d3.selectAll(id + ' .canton-contour').each(function(e) {
                    d3.select(this).classed('faded', true)
                    let matchSending = sending.filter(function(f) {
                        return f == e.properties.abbr
                    })
                    if (matchSending.length > 0) {
                        d3.select(this).classed('sending', true).classed('faded', false);
                    }

                    let matchReceiving = receiving.filter(function(f) {
                        return f == e.properties.abbr
                    })
                    if (matchReceiving.length > 0) {
                        d3.select(this).classed('receiving', true).classed('faded', false);
                    }
                });

                d3.selectAll(id + ' .label').each(function(e) {
                    d3.select(this).classed('faded', true)
                    let matchSending = sending.filter(function(f) {
                        return f == e.properties.abbr
                    })
                    if (matchSending.length > 0) {
                        d3.select(this).classed('sending', true).classed('faded', false);
                    }

                    let matchReceiving = receiving.filter(function(f) {
                        return f == e.properties.abbr
                    })
                    if (matchReceiving.length > 0) {
                        d3.select(this).classed('receiving', true).classed('faded', false);
                    }
                });

                d3.selectAll(id + ' .label')
                    .filter(function(e) {
                        return e.properties.abbr == thisCantonCode;
                    })
                    .classed('selected', true);

                d3.select(this)
                    .style('stroke', d3.color(concordatColors(thisCanton.properties.concordat)).darker(1))
                    .style('fill', d3.color(concordatColors(thisCanton.properties.concordat)).brighter(.6));

                svg.append('text')
                    .attr('id', 'viz-message')
                    .style('text-anchor', 'middle')
                    .attr('x', width / 2)
                    .attr('y', height - 5)
                    .text(viz_message)

                nodes = target_institutions;
                update();
            })
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
                .classed('over-selected-canton', function(d) {
                    return d.overSelectedCanton;
                })
                .attr("r", 1)
                .style('cursor', 'pointer')
                .merge(node)
                .on('click', function(d) {
                    buildSidepanel(d.id, 1900);
                })
                .attr('data-toggle', 'tooltip')
                .attr('data-placement', 'top')
                .attr('data-html', 'true')
                .attr('trigger', 'click')
                .attr('title', function(d) {
                    if (d.id.substring(0, 2) == 'XX') {
                        return `<div class="viz-tooltip"><span>Landmarks not specified</span></div>`;
                    } else {
                        let thisRecord = masterData.filter(function(e) {
                            return e.id == d.id;
                        })[0]
                        let name_landmark = thisRecord.name_landmark;
                        let city = thisRecord.city;
                        return `<div class="viz-tooltip"><span>${name_landmark}</span><br/><span>${city}</span></div>`;
                    }
                })

            node.transition()
                .duration(500)
                .attr('r', function(d) {
                    return d.overSelectedCanton ? 3 : fixedRadius;
                })
                .on("end", function(d,i,a) {
                    if (i == a.length - 1) {
                        $('[data-toggle="tooltip"]').tooltip()
                    }
                });

            nodeLabel = nodeLabel.data(nodes, function(d) { return d.id; });
            nodeLabel.exit().remove();

            nodeLabel = nodeLabel.enter()
                .merge(nodeLabel)
                .append("text")
                .classed('nodeLabel', true)
                .style('opacity', 0)
                .text(function(d) { return d.name_landmark; });

            nodeLabel.transition()
                .duration(500)
                .delay(300)
                .style('opacity', function(d) {
                    let code = d.id.match(/\D+/)[0];
                    if (code == 'XX') {
                        return 1;
                    }
                });

            simulation
                .nodes(nodes)
                .alpha(1)
                .on("tick", ticked)
                .restart();

            function ticked() {
                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })

                nodeLabel.attr("x", function(d) { return d.x; })
                    .attr("y", function(d) { return d.y - fixedRadius - 3; })
            }
        }
        reset();

        if (canton != undefined) {

            let filtered_edges = thisData.edges.filter(function(e) {
                if (config.direction == 'from') {
                    return e.sourceName == canton;
                } else {
                    return e.targetName == canton;
                }
            });

            let selected_institutions_id = [];
            filtered_edges.forEach(function(el) {
                // console.log(el.target_institutions);
                selected_institutions_id = selected_institutions_id.concat(el.target_institutions);
            });
            selected_institutions_id = _.uniq(selected_institutions_id);

            let selected_institutions = [];
            selected_institutions_id.forEach(function(e) {
                let correspondingId = masterData.filter(function(f) {
                    return e == f.id;
                })
                selected_institutions.push(correspondingId[0]);
            })

            selected_institutions.forEach(function(e) {
                e.centerX = projection([e.longitude, e.latitude])[0];
                e.centerY = projection([e.longitude, e.latitude])[1];
                e.x = e.centerX;
                e.y = e.centerY;
            })

            d3.selectAll(id + ' .canton-contour').each(function(d) {

                let sendingMatch = filtered_edges.find(function(el) {
                    return d.properties.abbr == el.sourceName;
                });
                let receivingMatch = filtered_edges.find(function(el) {
                    return d.properties.abbr == el.targetName;
                });

                d3.select(this).classed('faded', function(d) {
                    return sendingMatch == undefined && receivingMatch == undefined;
                });

                d3.select(this).classed('sending', function(d) {
                    return sendingMatch != undefined;
                });

                d3.select(this).classed('receiving', function(d) {
                    return receivingMatch != undefined;
                });

                if (config.direction == 'from') {
                    d3.select('.sending')
                        .style('stroke', d3.color(concordatColors(d.properties.concordat)).darker(1))
                        .style('fill', d3.color(concordatColors(d.properties.concordat)).brighter(.6));
                } else {
                    d3.select('.receiving')
                        .style('stroke', d3.color(concordatColors(d.properties.concordat)).darker(1))
                        .style('fill', d3.color(concordatColors(d.properties.concordat)).brighter(.6));
                }

                nodes = selected_institutions;
                update();
            });
            d3.selectAll(id + ' .label')
                .filter(function(e) {
                    return e.properties.abbr == canton;
                })
                .classed('selected', true);
        }

        function reset() {

            d3.selectAll(id + ' .canton-contour')
                .classed('sending', false)
                .classed('receiving', false)
                .classed('faded', false)
                .style('stroke', function(d) { return d3.color(concordatColors(d.properties.concordat)).darker(.75) })
                .style('stroke-width', .5 + 'px')
                .style('fill', function(d) { return d3.color(concordatColors(d.properties.concordat)) });

            d3.selectAll(id + ' .label').classed('faded', false);
            d3.selectAll(id + ' .label').classed('sending', false);
            d3.selectAll(id + ' .label').classed('receiving', false);
            d3.selectAll(id + ' .label').classed('selected', false);

            d3.selectAll('#viz-message').remove();

            node = node.data([], function(d) { return d.id; })

            node.exit().transition()
                .duration(500)
                .attr('r', 0)
                .filter(function(d) { return d.canton == 'not specified'; })
                .duration(1000)
                .attr('cx', width)
                .remove()

            nodeLabel = nodeLabel.data([], function(d) { return d.id; })

            nodeLabel.exit().transition()
                .duration(500)
                .style('opacity', 0)
                .remove()
        }

        // scrollama for hiding navbar at the bottom of the page
        navScroller.setup({
                step: '#last-element',
                offset: 0
            })
            .onStepEnter(updateNavbar)
            .onStepExit(resetNavbar);

        if (d3.select('.initial-loader').node() != null) {
            d3.select('.initial-loader').classed('content-loaded', true)
                .transition()
                .duration(1000)
                .style('opacity', 1e-6)
                .on('end', function(d) {
                    d3.select('.initial-loader').remove();
                });
        }

    } // draw

    function updateNavbar(step) {
        if (step.direction == 'down') {
            $('#navigation-sidebar').animate({ opacity: 0 }, 350);
        }
    }

    function resetNavbar(step) {
        if (step.direction == 'up') {
            $('#navigation-sidebar').animate({ opacity: 1 }, 350);
        }
    }

} // all
