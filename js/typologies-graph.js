function TypologiesGraph(id, data) {

    this.id = id;

    let svg, width, height;

    this.init = function() {
        this.svg = d3.select(this.id).append('svg');
        svg = this.svg;
    }

    this.draw = function(year) {
        // check if svg has been craeted, if not runs init()
        if (!this.svg) {
            this.init();
        }
        this.svg.style('border', '1px solid blue');
        width = d3.select(this.id)
            .node()
            .offsetWidth - 30;

        height = width * .6;
        if (height > window.innerHeight) { height = window.innerHeight * .8 }
        this.svg.attr('width', width)
            .attr('height', height);

        if(year) {
        	console.log(year)
        }

    }

}