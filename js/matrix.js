function Matrix(id, data, categories) {

    this.id = id;

    // set variable to save the two dimensions that will be visualized in the matrix
    let state = {};

    //define elements that will be present in the visualization
    let svg,
        matrix_x_axis,
        matrix_y_axis,
        matrix_x_grid,
        matrix_y_grid,
        bubblesArea,
        bubbles;

    //define dimensions of the container
    let width,
        height,
        margin,
        radius;

    if (data) {
        this.data = d3.nest()
            .key(function(d) { return d.survey_year; })
            .entries(data);
        // console.log(this.data);
        // console.log(categories);
    }

    // check if svg has already been created and if not, creates it
    if (!this.svg) {
        this.svg = d3.select(this.id).append('svg').classed('matrix-svg', true);
        svg = this.svg;
        matrix_x_axis = svg.append('g').classed('axis axis-x', true);
        matrix_y_axis = svg.append('g').classed('axis axis-y', true);
        matrix_x_grid = svg.append('g').classed('grid grid-x', true);
        matrix_y_grid = svg.append('g').classed('grid grid-y', true);
        bubblesArea = svg.append('g').classed('matrix-bubbles', true);
    }

    this.draw = function(year) {
        //get selection from dropdowns
        state.y = $('#scatterplot-y').val();
        state.x = $('#scatterplot-x').val();

        //calculate dimensions of the viz container, axis and grids
        width = $('#matrix-visualization').width();
        height = width * .8;
        margin = 140;
        svg.attr('width', width)
            .attr('height', height);
        matrix_x_axis.attr('transform', 'translate(0,' + (height - margin) + ')');
        matrix_y_axis.attr('transform', 'translate(' + margin + ', 0)');
        matrix_x_grid.attr('transform', 'translate(0,' + (height - margin) + ')');
        matrix_y_grid.attr('transform', 'translate(' + margin + ', 0)');

        //filter the data for the correct year
        let selectedYear = this.data.filter(function(el){return el.key == year;});
        let institutions = selectedYear[0].values;
        // console.log(institutions);

        //calculate correlations
        let correlationList = [];
        institutions.forEach(function(institute){
            // console.log(institute);
            for (let y = 0; y < institute[state.y].length; y++){
                for (let x = 0; x < institute[state.x].length; x++) {
                    let relationObject = {};
                    relationObject.id = institute.id;
                    relationObject.relation = institute[state.y][y] + '|' + institute[state.x][x];
                    correlationList.push(relationObject);
                }
            }
        });
        // console.log(correlationList);

        let finalList = d3.nest()
            .key(function(d){return d.relation})
            .rollup(function(leaves) {
                // associate the code with the correct case and get the amount
                let code = leaves[0].relation.split('|');
                    yCoordinate = categories[state.y][(+code[0] - 1)].label;
                    xCoordinate = categories[state.x][(+code[1] - 1)].label;

                return {'y': yCoordinate, 'x': xCoordinate, 'amount': leaves.length, 'list': leaves};
            })
            .entries(correlationList);
        // console.log(finalList);

        //set scales and axis and labels
        let yDomain = [],
            xDomain = [];

        categories[state.y].forEach(function(obj){
            yDomain.push(obj.label);
        });
        categories[state.x].forEach(function(obj){
            xDomain.push(obj.label);
        });

        let yScale = d3.scalePoint()
            .domain(yDomain)
            .range([height - margin, 0])
            .padding(0.5);
        let xScale = d3.scalePoint()
            .domain(xDomain)
            .range([margin, width])
            .padding(0.5);
        let rScale = d3.scaleSqrt()
            // .domain([0, d3.max(finalList, function(d){return d.value.amount})])
            .domain([0, 226])
            .range([0, 40]);

        let yAxis = d3.axisLeft(yScale)
            .tickSize(0)
            .tickPadding(8);
        let xAxis = d3.axisBottom(xScale)
            .tickSize(0)
            .tickPadding(8);

        let yGrid = d3.axisLeft(yScale)
            .ticks(yDomain.length)
            .tickSize(-width)
            .tickFormat('');
        let xGrid = d3.axisBottom(xScale)
            .ticks(xDomain.length)
            .tickSize(-height)
            .tickFormat('');

        //draw axes and grids
        svg.select('.axis-y')
            .transition()
            .call(yAxis);
        svg.select('.axis-x')
            .transition()
            .call(xAxis);

        svg.select('.grid-y')
            .transition()
            .call(yGrid);
        svg.select('.grid-x')
            .transition()
            .call(xGrid);

        //draw bubbles on matrix
        bubbles = bubblesArea.selectAll('.bubble')
            .data(finalList, function(d){
                return d.key;
            });

        bubbles.exit()
            .transition()
            .duration(500)
            .attr('r', 1e-6)
            .remove();

        bubbles = bubbles.enter()
            .append('circle')
            .classed('bubble', true)
            .attr('r', 1e-6)
            .on("click", function(d) {
                let newList = d.value.list.map(function(el){
                    return el.id;
                });
                let activeYear = $('#matrix .active-year').attr('data-id');
                buildSidepanelList(newList, activeYear);
            })
            .merge(bubbles)
            .attr('cx', function(d) {
                return xScale(d.value.x);
            })
            .attr('cy', function(d) {
                return yScale(d.value.y);
            })
            .style('cursor', 'pointer');

        bubbles.transition()
            .duration(300)
            .attr('r', function(d) {
                return rScale(d.value.amount);
            });

    }

}
