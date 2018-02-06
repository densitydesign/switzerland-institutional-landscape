// store data
let lawsData;

// set the dimensions of the timeline
let marginTimeline = {top: 0, right: 20, bottom: 0, left: 20},
    widthTimeline = ($('.timeline-container div').width() - marginTimeline.left - marginTimeline.right) * 8,
    heightTimeline = $('.timeline-container').height() - 20;

let marginMap = {top: 40, right: 40, bottom: 0, left: 40},
    widthMap = $('.geo-container').width() - marginMap.left - marginMap.right,
    heightMap = widthMap * .7 - marginMap.top;

// set up scales
let timeScale = d3.scaleTime()
    .range([0, widthTimeline]);
let colorScale = d3.scaleOrdinal()
    .domain(['cantonal', 'federal', 'intercantonal', 'international'])
    .range(['#CC2936', '#61988E', '#EDDEA4', '#EAE6DA']);

// time parser
let formatYear = d3.timeFormat('%Y');
let formatDate = d3.timeFormat('%B %d, %Y');

// set up axis
let xAxis = d3.axisBottom(timeScale)
    .ticks(d3.timeYear.every(5))
    .tickSize(6 - heightTimeline)
    .tickPadding(-22);

// define projection and path-generator variables
let projection = d3.geoMercator(),
    path = d3.geoPath().projection(projection);
// prepare variables to store geojsons
let swissOutline,
    cantons,
    oldCantons,
    union;

// append svgs
let svgTimeline = d3.select('.timeline-container div')
    .append('svg')
    .attr('width', widthTimeline + marginTimeline.left + marginTimeline.right)
    .attr('height', heightTimeline)
    .append('g')
    .attr('transform', 'translate(' + marginTimeline.left + ',' + marginTimeline.top + ')');

let svgMap = d3.select('.geo-container')
    .append('svg')
    .attr('width', widthMap + marginMap.left + marginMap.right)
    .attr('height', heightMap + marginMap.top);
let mapGroup = svgMap.append('g').classed('map-swiss', true).attr('transform', 'translate(' + marginMap.left + ',' + marginMap.top + ')'),
    swissBorderContainer = mapGroup.append('g').classed('map-country', true),
    cantonsBorderContainer = mapGroup.append('g').classed('map-cantons', true),
    legendGroup = svgMap.append('g').classed('map-legend', true).attr('transform', 'translate(0,' + marginMap.top + ')');

let infoContainer = d3.select('.description-container').append('div').classed('row', true);

d3.queue()
    .defer(d3.json, './../data_and_scripts/data/glossary-laws.json')
    .defer(d3.json, './../data_and_scripts/data/ch.json')
    .await(function(err, data, swiss) {
        if (err) throw err;
        // console.log(data);


        // DRAW TIMELINE

        // format the data
        data.forEach(function(d,i,a) {
            let dateArrayIssue = d.issue_date.split('-');
            let parsedIssue = new Date(Date.UTC(dateArrayIssue[0], dateArrayIssue[1] - 1, dateArrayIssue[2]));
            d.issue_date = parsedIssue;
            if (d.inforce_date != null) {
                let dateArrayInforce = d.inforce_date.split('-');
                let parsedInforce = new Date(Date.UTC(dateArrayInforce[0], dateArrayInforce[1] - 1, dateArrayInforce[2]));
                d.inforce_date = parsedInforce;
            }
            if (d.repeal_date != null) {
                let dateArrayRepeal = d.repeal_date.split('-');
                let parsedRepeal = new Date(Date.UTC(dateArrayRepeal[0], dateArrayRepeal[1] - 1, dateArrayRepeal[2]));
                d.repeal_date = parsedRepeal;
            }
            d.level = 0;
        });

        // sort the data
        let sortedData = data.sort(function(a, b) {
            return a.issue_date - b.issue_date;
        });

        // check distance between dots
        let levelCount = 0;
        sortedData.forEach(function(d, i, a) {
            if (i != 0) {
                if ((d.issue_date - a[i-1].issue_date) <= 3200000000) {
                    levelCount++;
                } else {
                    levelCount = 0;
                }
            }
            d.level = levelCount;
        });

        timeScale.domain(d3.extent(data, function(d) { return d.issue_date; }));

        lawsData = sortedData;

        let laws = svgTimeline.append('g')
            .classed('laws-group', true)
            .selectAll('.law-dot')
            .data(sortedData, function(d){
                return d.id;
            });

        laws.exit().remove();

        laws = laws.enter()
            .append('circle')
            .classed('law-dot', true)
            .attr('r', 1e-6)
            .merge(laws)
            .attr('cx', function(d) {
                return timeScale(d.issue_date);
            })
            .attr('cy', function(d) { return (heightTimeline + 20) / 2 - d.level * 12; })
            .attr('data-id', function(d){ return d.id;})
            .style('fill', function(d){
                return colorScale(d.range);
            })
            .on('click', function(d){
                d3.selectAll('.law-dot')
                    .classed('law-selected', false)
                    .transition()
                    .duration(350)
                    .ease(d3.easeBackIn.overshoot(4))
                    .attr('r', 5);
                d3.select(this)
                    .classed('law-selected', true)
                    .transition()
                    .duration(500)
                    .ease(d3.easeBackOut.overshoot(6))
                    .attr('r', 7);

                updateGlossary(d);
                location.replace(`#selected-${encodeURIComponent(d.id)}`);
                d3.event.preventDefault();
            });

        laws.transition()
            .duration(300)
            .delay(function(d,i){return i * 2;})
            .attr('r', 5);

        svgTimeline.insert('g', '.laws-group')
            .classed('axis-group', true)
            .attr('transform', 'translate(0,' + (heightTimeline) + ')')
            .call(customAxis);

        // transform topojson to geojson
        swissOutline = topojson.feature(swiss, swiss.objects.country);
        cantons = topojson.feature(swiss, swiss.objects.cantons);
        oldCantons = topojson.feature(swiss, swiss.objects.cantons);
        union = turf.union(oldCantons.features[1], oldCantons.features[25]);

        oldCantons.features[1] = union;
        oldCantons.features.pop();

        if (location.hash && location.hash != '#no-selection') {
            let selectedLaw = lawsData.find(function(d) { return d.id == location.hash.substring(10) });

            d3.select('.law-dot[data-id="' + location.hash.substring(10) + '"]')
                .classed('law-selected', true)
                .transition()
                .duration(500)
                .ease(d3.easeBackOut.overshoot(6))
                .attr('r', 7);

            let elementOffset = $('.law-selected').offset().left - $('.timeline-container').width() / 2;

            if (elementOffset > 0) {
                $('.timeline-container div').animate({
                    scrollLeft: elementOffset
                }, 2000);
            }

            updateGlossary(selectedLaw);

        } else {
            drawMap(2000, 'none');
            populatePanel();
        }
    });

function customAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
    g.selectAll(".tick line").attr("stroke", "#B0C5CE").attr("stroke-dasharray", "6,6");
    g.selectAll(".tick text").attr("x", -20).attr('fill', '#90BCCC');
}

function drawMap(selectedYear, canton) {

    // adapt map to viewport
    projection.fitSize([widthMap, heightMap], cantons);

    // project map
    let swissBorder = swissBorderContainer.selectAll('path')
        .data(swissOutline.features);

    swissBorder.exit()
        .transition()
        .duration(500)
        .style('opacity', 1e-6)
        .remove();

    swissBorder.enter()
        .append('path')
        .classed('swiss-contour', true)
        .style('opacity', 1e-6)
        .merge(swissBorder)
        .attr("d", path)
        .transition()
        .duration(500)
        .style('opacity', 0.8);

    let cantonsBorder = cantonsBorderContainer.selectAll('path')
        .data(function(d){
            if (selectedYear < 1980) {
                return oldCantons.features;
            } else {
                return cantons.features;
            }
        });

    cantonsBorder.exit()
        .transition()
        .duration(500)
        .style('opacity', 1e-6)
        .remove();

    cantonsBorder.enter()
        .append('path')
        .classed('canton-contour', true)
        .style('opacity', 1e-6)
        .style('fill', '#FFFFFF')
        .style('stroke', '#999999')
        .merge(cantonsBorder)
        .attr('d', path)
        .attr('data-canton', function(d){
            return d.properties.abbr;
        })
        .transition()
        .duration(500)
        .style('opacity', 0.8)
        .style('stroke', function(d){
            if (canton == 'CH') {
                return '#FFFFFF';
            } else {
                return '#999999';
            }
        })
        .style('fill', function(d){
            if (Array.isArray(canton)) {
                let match = canton.find(function(el){
                    return el == d.properties.abbr;
                });
                if (match != undefined) {
                    return '#EDDEA4';
                } else {
                    return '#FFFFFF';
                }
            } else {
                if (canton == 'CH') {
                    return '#61988E';
                } else if (canton == 'IN') {
                    return '#EAE6DA';
                } else if (d.properties.abbr == canton) {
                    return '#CC2936';
                } else {
                    return '#FFFFFF';
                }
            }
        });

    // add legend
    let legendTitle = legendGroup.selectAll('.item-title')
        .data(['Legal text range:']);

    legendTitle.enter()
        .append('text')
        .classed('item-title', true)
        .attr('x', 15)
        .attr('y', 0)
        .style('opacity', 1e-6)
        .text(function(d){
            return d;
        })
        .transition()
        .duration(500)
        .delay(500)
        .style('opacity', 1);;

    let item = legendGroup.selectAll('.item')
        .data([{'color': '#CC2936', 'label': 'cantonal'}, {'color': '#61988E', 'label': 'federal'}, {'color': '#EDDEA4', 'label': 'intercantonal'}, {'color': '#EAE6DA', 'label': 'international'}])
        .enter()
        .append('g')
        .classed('item', true);

    item.append('rect')
        .classed('item-color', true)
        .style('opacity', 1e-6)
        .style('stroke', '#999999')
        .style('stroke-width', .5)
        .attr('width', 15)
        .attr('height', 15)
        .attr('x', 15)
        .attr('y', function(d, i){
            return 12 + i * 20;
        })
        .style('fill', function(d){
            return d.color;
        })
        .transition()
        .duration(500)
        .delay(function(d, i) { return 500 + i * 20 })
        .style('opacity', 0.8);

    item.append('text')
        .classed('item-text', true)
        .style('opacity', 1e-6)
        .attr('x', 40)
        .attr('y', function(d, i){
            return i * 20 + 22;
        })
        .text(function(d){
            return d.label;
        })
        .transition()
        .duration(500)
        .delay(function(d, i) { return 500 + i * 20 })
        .style('opacity', 1);
}

function populatePanel(data) {
    // console.log(data);

    if (data != undefined) {
        // console.log(data);
        let lawData = [];
        lawData.push(data);

        d3.select('.no-info-box')
            .transition()
            .duration(300)
            .style('opacity', 1e-6)
            .remove();

        let infoBox = infoContainer.selectAll('.info-box')
            .data(lawData);

        infoBox.enter()
            .append('div')
            .attr('class', 'col-11 info-box mt-4 pl-4')
            .style('opacity', 1e-6)
            .merge(infoBox)
            .html(function(d){
                let issueDate,
                    inforceDate,
                    repealDate;

                if (d.original_issue_date.length == 4) {
                    issueDate = d.original_issue_date;
                } else {
                    issueDate = formatDate(d.issue_date);
                }

                let newContent = `
                    <div class="title">
                        <h6 class="font-weight-bold">Legal text information:</h6>
                    </div>
                    <div class="typology field">
                        <div class="label">Typology</div>
                        <div class="value">${d.typology == null ? '-' : d.typology}</div>
                    </div>
                    <div class="range field">
                        <div class="label">Range</div>
                        <div class="value">${d.range}</div>
                    </div>
                    <div class="name field">
                        <div class="label">Title</div>
                        <div class="value">${d.title}</div>
                    </div>
                    <div class="canton field">
                        <div class="label">Affected Cantons</div>
                        <div class="value">${d.canton == 'CH' || d.canton == 'IN' ? 'All' : d.range == 'intercantonal' && d.canton.length > 0 ? d.canton.slice(24) : d.canton == '' ? 'Not specified' : d.canton}</div>
                    </div>
                    <div class="issue-date field">
                        <div class="label">Issue Date</div>
                        <div class="value">${issueDate}</div>
                    </div>`;
                if (d.inforce_date != null) {
                    if (d.original_inforce_date.length == 4) {
                        inforceDate = d.original_inforce_date;
                    } else {
                        inforceDate = formatDate(d.inforce_date);
                    }
                    newContent += `
                        <div class="inforce-date field">
                            <div class="label">Enforcement Date</div>
                            <div class="value">${inforceDate}</div>
                        </div>`;
                }
                if (d.repeal_date != null) {
                    if (d.original_repeal_date.length == 4) {
                        repealDate = d.original_repeal_date;
                    } else {
                        repealDate = formatDate(d.repeal_date);
                    }
                    newContent += `
                        <div class="repeal-date field">
                            <div class="label">Repeal Date</div>
                            <div class="value">${repealDate}</div>
                        </div>`;
                }
                if (d.articles != '') {
                    newContent += `
                        <div class="articles field">
                            <div class="label">Relevant Articles</div>
                            <div class="value">${d.articles}</div>
                        </div>`;
                }
                return newContent;
            })
            .transition()
            .duration(300)
            .delay(300)
            .style('opacity', 1);

    } else {
        d3.select('.info-box')
            .transition()
            .duration(300)
            .style('opacity', 1e-6)
            .remove();

        let noInfoText = infoContainer.append('div')
            .attr('class', 'col-12 no-info-box text-center mt-5')
            .style('opacity', 1e-6)
            .text('No legal text selected.')

        noInfoText.transition()
            .duration(300)
            .delay(500)
            .style('opacity', 1);
    }
}

function updateGlossary(d) {
    // console.log(d);

    let cantonArray = [];
    let newYear = formatYear(d.issue_date);

    if (d.range == 'intercantonal' && d.canton.length > 0) {
        let cantonList = d.canton.slice(24).split(', ');
        cantonArray = cantonArray.concat(cantonList);
        drawMap(+newYear, cantonArray);
    } else {
        drawMap(+newYear, d.canton);
    }

    populatePanel(d);

}
