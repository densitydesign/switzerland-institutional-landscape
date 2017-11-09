let timeline;

$( document ).ready(function() {


  timeline = new Timeline('#timeline', {'data': 1});

  timeline.draw();

  window.addEventListener("resize", function(){
  	if(d3.select(timeline.id).node().offsetWidth-30 != timeline.width) {
  		console.log('redraw timeline')
  		timeline.draw();
  	}
  });

});