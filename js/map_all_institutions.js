function MapAll(id, swiss, data) {

    this.id = id;

    if (data) {
        this.data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        console.log(this.data);
        console.log(swiss);
    }

    this.init = function() {

    }



    this.draw = function(year) {
        // check if svg has already been created and if not, runs init()
        if (!this.svg) {
            this.init();
        }
    }

}
