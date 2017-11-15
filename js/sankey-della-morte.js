function SurviesSankey(id, data) {

    this.id = id;

    let svg,
        width,
        height;

    if (!this.svg) {
        // check if svg has been craeted, if not runs init()
        svg = this.svg = d3.select(this.id).append('svg');
    }

    this.draw = function(year) {

        let thisData;
        if (year) {
            thisData = data[year];
        } else {
            thisData = data[1933];
        }

        width = d3.select(this.id).node().offsetWidth - 30;

        height = width * .6;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        svg.attr('width', width)
            .attr('height', height)
            .style('border', '1px solid orange');

        // g.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");



        
    } // draw

} // all