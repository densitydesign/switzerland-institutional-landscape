// set the dimensions of the timeline
let margin = {top: 0, right: 20, bottom: 0, left: 20},
    width = ($('.timeline-container div').width() - margin.left - margin.right) * 8,
    height = $('.timeline-container').height() - 20;

// set up scales
let timeScale = d3.scaleTime()
    .range([0, width]);
let colorScale = d3.scaleOrdinal()
    .domain(['cantonal', 'federal', 'intercantonal', 'international'])
    .range(['#CC2936', '#61988E', '#EDDEA4', '#EAE6DA']);

// time parser
let formatDate = d3.timeFormat('%Y');

// set up axis
let xAxis = d3.axisBottom(timeScale)
    .ticks(d3.timeYear.every(5))
    .tickSize(6 - height)
    .tickPadding(-22);

// append svg
let svg = d3.select('.timeline-container div')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.queue()
    .defer(d3.json, './../data_and_scripts/data/glossary-laws.json')
    .defer(d3.json, './../data_and_scripts/data/ch.json')
    .await(function(err, data, swiss) {
        if (err) throw err;
        // console.log(data);

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
        // 1 month = 2592000000
        // 1.5 months = 3888000000
        let levelCount = 0;
        sortedData.forEach(function(d, i, a) {
            // let overlapCounter = 1;
            if (i != 0) {
                // while ((d.issue_date - a[i-overlapCounter].issue_date) <= 2592000000) {
                //     overlapCounter++;
                // }
                if ((d.issue_date - a[i-1].issue_date) <= 3200000000) {
                    // if (a[i-(overlapCounter - 1)].level != 0 && a[i-1].level != 0) {
                    //     levelCount = 0;
                    // } else {
                    //     levelCount++;
                    // }
                    levelCount++;
                    // console.log(d.id + ', diff: ' + ((overlapCounter - 1) - a[i-(overlapCounter - 1)].level));
                    // console.log('bottom object at level: ' + a[i-(overlapCounter - 1)].level);
                    // console.log('overlap: ' + (overlapCounter - 1));
                    // console.log('levelCount: ' + levelCount);
                } else {
                    levelCount = 0;
                }
            }

            d.level = levelCount;
            // console.log(d.id + ', level: ' + d.level);
        });

        timeScale.domain(d3.extent(data, function(d) { return d.issue_date; }));

        let laws = svg.append('g')
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
            .attr('cy', function(d) { return (height + 20) / 2 - d.level * 10; })
            .attr('data-id', function(d){ return d.id;})
            .style('fill', function(d){
                return colorScale(d.range);
            });

        laws.transition()
            .duration(300)
            .delay(function(d,i){return i * 2;})
            .attr('r', 5);

        svg.insert('g', '.laws-group')
            .classed('axis-group', true)
            .attr('transform', 'translate(0,' + (height) + ')')
            .call(customAxis);


        function customAxis(g) {
            g.call(xAxis);
            g.select(".domain").remove();
            g.selectAll(".tick line").attr("stroke", "#B0C5CE").attr("stroke-dasharray", "6,6");
            g.selectAll(".tick text").attr("x", -20).attr('fill', '#90BCCC');
        }
    });
