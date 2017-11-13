let timeline,
    bubblechart,
    typologiesGraph,
    map_all_institutions;

$(document).ready(function() {

    // load asynchronously the datasets
    var dataFiles = ['./data_and_scripts/data/master.json', './data_and_scripts/data/bubblechart.json', './data_and_scripts/data/typologies-graph.json'],
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

        typologiesGraph = new TypologiesGraph('#typologies-graph', datasets[2]);
        typologiesGraph.draw();


        // Add listener for window resize event, which triggers actions such as the resize of visualizations.
        window.addEventListener("resize", function() {

            // handle timeline resizing
            if (d3.select(timeline.id).node().offsetWidth - 30 != timeline.width) {
                timeline.draw();
            }

            // handle bubblechart resizing
            if (d3.select(bubblechart.id).node().offsetWidth - 30 != bubblechart.width) {
                bubblechart.draw();
            }

            // handle typologies graph resizing
            if (d3.select(typologiesGraph.id).node().offsetWidth - 30 != typologiesGraph.width) {
                typologiesGraph.draw();
            }

        });

        // To be called after all the charts have been initialized
        // call here the functions the initialize the waypoints for chapter 2, because it needs to calculate the space occupied by the viz in chapter 1
        $(document).trigger('setWaypoints');
    });

    // load asynchronously the datasets for chapter 2
    d3.queue()
        .defer(d3.json, './data_and_scripts/data/ch.json')
        .defer(d3.json, './data_and_scripts/data/map_all_institutions.json')
        .await(function(error, swiss, data) {
            if (error) throw error;

            map_all_institutions = new MapAll('#maps-visualization', swiss, data);
            map_all_institutions.draw(1954);
        });

});

$(document).on('setWaypoints', function() {
    //save the selection to a variable to improve performance
    let $map = $('#maps');

    // initiate waypoints
    // waypoint for typology map. call function to draw the typologies if going down, to draw total map if going up
    let second_waypoint = new Waypoint({
        element: document.getElementById('map-typology-text'),
        handler: function(direction) {
            if(direction == 'down'){
                // console.log('call map_typologies 1954');
            } else {
                // console.log('call map_all_institutions 1954');
            }
        },
        offset: '40%'
    });
    // waypoint for capacity map. call function to draw the capacities if going down, to draw typologies if going up
    let third_waypoint = new Waypoint({
        element: document.getElementById('map-capacity-text'),
        handler: function(direction) {
            if(direction == 'down'){
                // console.log('call map_capacities 1954');
            } else {
                // console.log('call map_typologies 1954');
            }
        },
        offset: '40%'
    });
    // waypoint for confession map. call function to draw the confession if going down, to draw capacities if going up
    let fourth_waypoint = new Waypoint({
        element: document.getElementById('map-confession-text'),
        handler: function(direction) {
            if(direction == 'down'){
                // console.log('call map_confession 1954');
            } else {
                // console.log('call map_capacities 1954');
            }
        },
        offset: '40%'
    });
    // waypoint for gender map. call function to draw the gender if going down, to draw confession if going up
    let fifth_waypoint = new Waypoint({
        element: document.getElementById('map-gender-text'),
        handler: function(direction) {
            if(direction == 'down'){
                // console.log('call map_gender 1954');
            } else {
                // console.log('call map_confession 1954');
            }
        },
        offset: '40%'
    });
});
