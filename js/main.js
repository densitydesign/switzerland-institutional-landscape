let timeline,
    bubblechart,
    map_total;

$(document).ready(function() {

    // load asynchronously the datasets
    var dataFiles = ['./data_and_scripts/data/master.json', './data_and_scripts/data/timeline.json'],
        queue = d3.queue();

    dataFiles.forEach(function(filename) {
        queue.defer(d3.json, filename);
    });

    queue.awaitAll(function(err, datasets) {
        if (err) {
            console.error(err);
        }
        // console.log('loaded datasets:', datasets);

        timeline = new Timeline('#timeline');
        timeline.draw();

        bubblechart = new Bubblechart('#bubblechart', datasets[1]);
        bubblechart.draw();


        // Add listener for window resize event, which triggers actions such as the resize of visualizations.
        window.addEventListener("resize", function() {

            // handle timeline resizing
            if (d3.select(timeline.id).node().offsetWidth - 30 != timeline.width) {
                console.log('redraw timeline')
                timeline.draw();
            }

            // handle bubblechart resizing
            if (d3.select(bubblechart.id).node().offsetWidth - 30 != bubblechart.width) {
                console.log('redraw bubblechart')
                bubblechart.draw();
            }

        });
    });

    d3.queue()
        .defer(d3.json, './data_and_scripts/data/ch.json')
        .defer(d3.json, './data_and_scripts/data/map_total.json')
        .await(function(error, swiss, data) {
            if (error) throw error;

            map_total = new MapTotal('#map-total', swiss, data);
            map_total.draw(1954);
        })

});
