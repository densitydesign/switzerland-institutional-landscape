// store data
let lawsData;

// set the dimensions of the timeline
let marginTimeline = {top: 0, right: 20, bottom: 0, left: 20},
    widthTimeline = ($('.timeline-container div').width() - marginTimeline.left - marginTimeline.right) * 12,
    heightTimeline = $('.timeline-container').height() - 20;

let marginMap = {top: 40, right: 40, bottom: 0, left: 80},
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

let infoContainer = d3.select('.description-container');

let navHeight = $('.glossary-nav').height();

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
            .attr('cy', function(d) { return (heightTimeline + 40) / 2 - d.level * 12; })
            .attr('data-id', function(d){ return d.id;})
            .style('fill', function(d){
                return colorScale(d.range);
            })
            .attr('data-toggle', 'tooltip')
            .attr('data-placement', 'top')
            .attr('data-html', 'true')
            .attr('title', function(d){
                let lawTitle = d.title;
                let lawDate;
                let lawCanton;
                if (d.original_issue_date.length == 4) {
                    lawDate = d.original_issue_date;
                } else {
                    lawDate = formatDate(d.issue_date);
                }
                if (d.range == 'cantonal') {
                    lawCanton = 'canton ' + d.canton;
                } else {
                    lawCanton = d.range;
                }
                return `<div class="viz-tooltip-laws"><span>${lawCanton}</span><br/><span>${lawTitle}</span><br/><span>${lawDate}</span></div>`;
            })
            .on('click', function(d){
                d3.selectAll('.law-dot')
                    .classed('law-selected', false)
                    .classed('law-faded', true)
                    .transition()
                    .duration(350)
                    .ease(d3.easeBackIn.overshoot(4))
                    .attr('r', 5);
                d3.select(this)
                    .classed('law-selected', true)
                    .classed('law-faded', false)
                    .transition()
                    .duration(500)
                    .ease(d3.easeBackOut.overshoot(6))
                    .attr('r', 7);

                updateMap(d);
                updateGlossary(d);
                updateSearch(d);
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

        populatePanel(lawsData);

        if (location.hash) {
            let selectedLaw = lawsData.find(function(d) { return d.id == location.hash.substring(10) });

            updateTimeline(selectedLaw);
            updateMap(selectedLaw);
            updateSearch(selectedLaw);

        } else {
            drawMap(2000, 'none');
        }

        $('[data-toggle="tooltip"]').tooltip()
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
        // .on('click', function(d){
        //     let selectedLaws = lawsData.filter(function(el){
        //         if (el.range == 'intercantonal' && el.canton.length > 0) {
        //             let cantonList = el.canton.slice(24).split(', ');
        //             return cantonList.indexOf(d.properties.abbr) != -1;
        //         } else {
        //             return el.canton == d.properties.abbr || el.canton == 'IN' || el.canton == 'CH';
        //         }
        //     });
        //     populatePanel(selectedLaws);
        // })
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

    let item = legendGroup.selectAll('.item-legend')
        .data([{'color': '#CC2936', 'label': 'cantonal'}, {'color': '#61988E', 'label': 'federal'}, {'color': '#EDDEA4', 'label': 'intercantonal'}, {'color': '#EAE6DA', 'label': 'international'}])
        .enter()
        .append('g')
        .classed('item-legend', true);

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

    let lawData = [];
    if (Array.isArray(data)) {
        lawData = data;
    } else {
        lawData.push(data);
    }

    let infoBox = infoContainer.selectAll('.item')
        .data(lawData);

    infoBox.enter()
        .append('div')
        .attr('class', 'col-12 item py-3 pl-1 pr-4')
        .attr('id', function(d) {
            return d.id;
        })
        .on('click', function(d) {
            $('.item').removeClass('active');
            $('.item[id=' + d.id +']').addClass('active');

            updateMap(d);
            updateTimeline(d);
            updateSearch(d);
            location.replace(`#selected-${encodeURIComponent(d.id)}`);
            d3.event.preventDefault();
        })
        .merge(infoBox)
        .html(function(d){
            let issueDate,
                inforceDate,
                repealDate;

            let date = new Date()
            let url = location;

            let quotation = `${d.title}, in: Switzerland's institutional landscape 1933–1980, Independent Expert Commission on Administrative Detention (Ed.), accessed on ${date.toDateString()}, URL: ${url}`;

            if (d.original_issue_date.length == 4) {
                issueDate = d.original_issue_date;
            } else {
                issueDate = formatDate(d.issue_date);
            }

            let newContent = `
                <div class="name field">
                    <div class="label font-weight-bold">Title</div>
                    <div class="value font-weight-bold">${d.title}</div>
                </div>
                <div class="typology field">
                    <div class="label">Typology</div>
                    <div class="value">${d.typology == null ? '-' : d.typology}</div>
                </div>
                <div class="range field">
                    <div class="label">Range</div>
                    <div class="value">${d.range}</div>
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
            newContent += `
                <div class="copy field">
                    <div class="label"></div>
                    <div class="value"><div class="item-copy-to-clipboard" data-clipboard-text="${quotation}">Copy citation to clipboard</div></div>
                </div>`;
            return newContent;
        });

        if (location.hash) {
            let selectedLaw = lawsData.find(function(d) { return d.id == location.hash.substring(10) });
            updateGlossary(selectedLaw);
        }

        d3.selectAll('.item-copy-to-clipboard').on('click', function(){
            // console.log(this);
            d3.selectAll('.item-copy-to-clipboard')
                .classed('copied', false)
                .html('Copy citation to clipboard');
            d3.select(this)
                .classed('copied', true)
                .html('Citation copied to clipboard');
        })

        new ClipboardJS('.item-copy-to-clipboard');
}

function updateMap(d) {
    let cantonArray = [];
    let newYear = formatYear(d.issue_date);

    if (d.range == 'intercantonal' && d.canton.length > 0) {
        let cantonList = d.canton.slice(24).split(', ');
        cantonArray = cantonArray.concat(cantonList);
        drawMap(+newYear, cantonArray);
    } else {
        drawMap(+newYear, d.canton);
    }
}

function updateGlossary(d) {

    $('.item').removeClass('active');
    $('.item[id=' + d.id +']').addClass('active');

    let scrollOffset = document.querySelector('.description-container').scrollTop;
    let itemOffset = $('.item[id=' + d.id +']').offset().top + scrollOffset - navHeight;
    // console.log(scrollOffset);
    // console.log($('.item[id=' + d.id +']').offset().top);
    // console.log(itemOffset);

    $('.description-container').animate({
        scrollTop: itemOffset + 'px'
    }, 1000);

}

function updateTimeline(d) {

    d3.selectAll('.law-dot')
        .classed('law-selected', false)
        .classed('law-faded', true)
        .transition()
        .duration(350)
        .ease(d3.easeBackIn.overshoot(4))
        .attr('r', 5);

    d3.select('.law-dot[data-id="' + d.id + '"]')
        .classed('law-selected', true)
        .classed('law-faded', false)
        .transition()
        .duration(500)
        .ease(d3.easeBackOut.overshoot(6))
        .attr('r', 7);

    d3.select('.item[id="' + d.id + '"]')
        .classed('active', true);

    let timelineCentered = $('.description-container').width() + $('.timeline-container').width() / 2;
    let timelineOffset = document.querySelector('.timeline-container div').scrollLeft;
    let dotOffset = $('.law-dot[data-id="' + d.id + '"]').offset().left + timelineOffset - timelineCentered;
    // console.log(timelineOffset);
    // console.log($('.law-dot[data-id="' + d.id + '"]').offset().top);
    // console.log(dotOffset);

    $('.timeline-container div').animate({
        scrollLeft: dotOffset
    }, 1000);
}

function searchLawList(d) {
    // Declare variables
    var input, filter, ul, li, a, i;

    input = document.getElementById('lawsSearchList');
    filter = input.value.toUpperCase();

    ul = document.getElementsByClassName("description-container");
    // console.log(ul)
    li = ul[0].getElementsByClassName('item');
    // console.log(li)

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {

        let currentId = li[i].getAttribute('id');
        let currentLaw = $('.law-dot[data-id="' + currentId + '"]');
        li[i].style.display = "none";
        currentLaw.addClass('law-hidden');

        value = li[i].getElementsByClassName("name")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            currentLaw.removeClass('law-hidden');
        }

        value = li[i].getElementsByClassName("typology")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            currentLaw.removeClass('law-hidden');
        }

        value = li[i].getElementsByClassName("range")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            currentLaw.removeClass('law-hidden');
        }

        value = li[i].getElementsByClassName("canton")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            currentLaw.removeClass('law-hidden');
        }

        value = li[i].getElementsByClassName("issue-date")[0].getElementsByClassName("value")[0];
        if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            currentLaw.removeClass('law-hidden');
        }

        if (li[i].getElementsByClassName("inforce-date").length > 0) {
            value = li[i].getElementsByClassName("inforce-date")[0].getElementsByClassName("value")[0];
            if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
                currentLaw.removeClass('law-hidden');
            }
        }

        if (li[i].getElementsByClassName("repeal-date").length > 0) {
            value = li[i].getElementsByClassName("repeal-date")[0].getElementsByClassName("value")[0];
            if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
                currentLaw.removeClass('law-hidden');
            }
        }

        if (li[i].getElementsByClassName("articles").length > 0) {
            value = li[i].getElementsByClassName("articles")[0].getElementsByClassName("value")[0];
            if (value.innerHTML.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
                currentLaw.removeClass('law-hidden');
            }
        }

    }
}

function updateSearch(d) {
    let selectionName = `${d.id} - ${d.title}`;
    d3.select('.selected-institution .selected-name')
        .html(selectionName);

    d3.select('.selected-institution')
        .style('display', 'block');

    d3.select('.search-institution')
        .style('display', 'none');

    $('.search-institution input').val('');
}

function resetLaws() {
    // console.log('reset');
    d3.select('.selected-institution')
        .style('display', 'none')

    d3.select('.search-institution')
        .style('display', 'flex')

    $('.item').removeClass('active');

    d3.selectAll('.law-dot')
        .classed('law-selected', false)
        .classed('law-faded', false)
        .classed('law-hidden', false)
        .transition()
        .duration(350)
        .ease(d3.easeBackIn.overshoot(4))
        .attr('r', 5);

    drawMap(2000, 'none');

    history.pushState("", document.title, window.location.pathname + window.location.search);
}

$(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
        resetLaws();
    }
});
