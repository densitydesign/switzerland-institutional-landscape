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
let formatDate = d3.timeFormat('%Y');

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

// define variable that saves the data
let lawsData;

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
    cantonsBorderContainer = mapGroup.append('g').classed('map-cantons', true);

d3.queue()
    .defer(d3.json, './../data_and_scripts/data/glossary-laws.json')
    .defer(d3.json, './../data_and_scripts/data/ch.json')
    .await(function(err, data, swiss) {
        if (err) throw err;
        // console.log(data);


        // DRAW TIMELINE

        // format the data
        data.forEach(function(d,i,a) {
            let dateArray = d.issue_date.split('-');
            let parsed = new Date(Date.UTC(dateArray[0], dateArray[1] - 1, dateArray[2]));
            d.issue_date = parsed;
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

        lawsData = sortedData;

        timeScale.domain(d3.extent(data, function(d) { return d.issue_date; }));

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
            .on('click', updateGlossary);

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

        drawMap(2000, 'none');
    });

function customAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
    g.selectAll(".tick line").attr("stroke", "#B0C5CE").attr("stroke-dasharray", "6,6");
    g.selectAll(".tick text").attr("x", -20).attr('fill', '#90BCCC');
}

function drawMap(selectedYear, canton, range) {

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
}

function updateGlossary(d) {
    console.log(d);
    console.log(lawsData);
    let cantonArray = [];
    let newYear = formatDate(d.issue_date);

    if (d.range == 'intercantonal' && d.canton.length > 0) {
        let cantonList = d.canton.slice(24).split(', ');
        cantonArray = cantonArray.concat(cantonList);
        drawMap(+newYear, cantonArray, d.range);
    } else {
        drawMap(+newYear, d.canton, d.range);
    }

}
