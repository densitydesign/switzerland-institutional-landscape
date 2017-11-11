let timeline,
    bubblechart,
    map_all_institutions;

$(document).ready(function() {

    // load asynchronously the datasets for chapter 1
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
        
        // call here the functions the initialize the waypoints for chapter 2, because it needs to calculate the space occupied by the viz in chapter 1
        $(document).trigger('setWaypoints');


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
    
    // load asynchronously the datasets for chapter 2
    d3.queue()
        .defer(d3.json, './data_and_scripts/data/ch.json')
        .defer(d3.json, './data_and_scripts/data/map_total.json')
        .await(function(error, swiss, data) {
            if (error) throw error;

            map_all_institutions = new MapAll('#maps', swiss, data);
            map_all_institutions.draw(1954);
        });

});

$(document).on('setWaypoints', function() {
    //get position of map viz in respect to viewport, it will be needed for fixing the map to the viewport
    let viewportHeight = $(window).height(),
        mapHeight = $('#maps').innerHeight();
        
    // initiate waypoints
    // waypoint for total map. as soon as it's reached, fix the map to the viewport
    let starting_waypoint = new Waypoint({
        element: document.getElementById('map-total-text'),
        handler: function(direction) {
            if(direction == 'down'){
                let $map = $('#maps'),
                    dimensions = getDimensions('#maps'),
                    leftBound = dimensions.left,
                    width = dimensions.width;
                $map.css({'width': width + 'px', 'left': leftBound, 'bottom': 0})
                $map.addClass('fixed');
            } else {
                $('#maps').removeClass('fixed');
            }
        },
        offset: function() {
            return viewportHeight - mapHeight;
        }
    });
    // waypoint for typology map. call function to draw the typologies if going down, to draw total map if going up
    let second_waypoint = new Waypoint({
        element: document.getElementById('map-typology-text'),
        handler: function(direction) {
            if(direction == 'down'){
                $('#maps').css('background-color', 'red');
            } else {
                $('#maps').css('background-color', '#ddd');
            }
        },
        offset: function() {
            return viewportHeight - mapHeight;
        }
    });
    // waypoint for capacity map. call function to draw the capacities if going down, to draw typologies if going up
    let third_waypoint = new Waypoint({
        element: document.getElementById('map-capacity-text'),
        handler: function(direction) {
            if(direction == 'down'){
                $('#maps').css('background-color', 'green');
            } else {
                $('#maps').css('background-color', 'red');
            }
        },
        offset: function() {
            return viewportHeight - mapHeight;
        }
    });
    // waypoint for confession map. call function to draw the confession if going down, to draw capacities if going up
    let fourth_waypoint = new Waypoint({
        element: document.getElementById('map-confession-text'),
        handler: function(direction) {
            if(direction == 'down'){
                $('#maps').css('background-color', 'blue');
            } else {
                $('#maps').css('background-color', 'green');
            }
        },
        offset: function() {
            return viewportHeight - mapHeight;
        }
    });
    // waypoint for gender map. call function to draw the gender if going down, to draw confession if going up
    let fifth_waypoint = new Waypoint({
        element: document.getElementById('map-gender-text'),
        handler: function(direction) {
            if(direction == 'down'){
                $('#maps').css('background-color', 'yellow');
            } else {
                $('#maps').css('background-color', 'blue');
            }
        },
        offset: function() {
            return viewportHeight - mapHeight;
        }
    });
    // closing waypoint. Put the map back in to the flow of the document
    let ending_waypoint = new Waypoint({
        element: document.getElementById('map-gender-text'),
        handler: function(direction) {
            if(direction == 'down'){
                let $map = $('#maps');
                $map.css({'align-self': 'flex-end'})
                $map.removeClass('fixed');
            } else {
                let $map = $('#maps'),
                    dimensions = getDimensions('#maps'),
                    leftBound = dimensions.left,
                    width = dimensions.width;
                $map.addClass('fixed');
                $map.css({'width': width + 'px', 'align-self': 'flex-start', 'left': leftBound, 'bottom': 0})
            }
        },
        offset: 'bottom-in-view'
    });
});

function getDimensions(selector) {
    let $element = $(selector),
        width = $element.innerWidth(),
        height = $element.innerHeight(),
        leftBound = $element.offset().left;
    return {
        'width': width,
        'height': height,
        'left': leftBound
    }
}
