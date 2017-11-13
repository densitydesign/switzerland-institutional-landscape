function TypologiesGraph(id, data) {

    this.id = id;

    if (data) {
        data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        console.log(data)
    }

    let svg,
        width,
        height,
        nodes,
        links,
        simulation,
        g,
        link,
        node,
        label;

    if (!this.svg) {
        // check if svg has been craeted, if not runs init()
        this.svg = d3.select(this.id).append('svg');
        svg = this.svg;
        svg.style('border', '1px solid blue');
    }

    this.draw = function(year) {

        width = d3.select(this.id)
            .node()
            .offsetWidth - 30;

        height = width * .6;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        this.svg.attr('width', width)
            .attr('height', height);

        if (year) {
            console.log(year)
        }

    }

}