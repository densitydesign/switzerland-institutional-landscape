function Timeline(id, data) {
	
	this.id = id;
	this.data = data;
	this.svg;
	this.width;

	this.init = function() {
		this.svg = d3.select(this.id).append('svg');
	}

	this.draw = function(date, tipologia) {
		if(!this.svg) {
			this.init();
		}
		this.svg.style('border', '1px solid violet');
		this.width = d3.select(this.id).node().offsetWidth-30;
		this.svg.attr('width',this.width).attr('height',window.innerHeight*.5);

		if (date) {
			console.log(date);
		}

		if (tipologia) {
			console.log(tipologia);
		}


	}
	
}