console.log('glossary');

d3.json('./data_and_scripts/data/master.json', function(err, data){
	// if err throw error;
	console.log(data);

	let item = d3.select('.list-container').selectAll('.item')


	item = item.data(data);

	item.exit().remove();

	item = item.enter().append('div').classed('item', true);

	item.append('div').html(function(d){ return d.id });

})

