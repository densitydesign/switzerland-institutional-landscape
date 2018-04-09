const fs = require('fs');
const d3 = require('d3');
const _ = require('lodash');
const node_xj = require("xls-to-json");

let graph = {},
    originalNodes, originalEdges;

node_xj({
    input: "data/master-dataset.xlsx", // input xls
    output: null, // output json
    sheet: "nodes" // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        originalNodes = result;

        node_xj({
            input: "data/master-dataset.xlsx", // input xls
            output: null, // output json
            sheet: "edges" // specific sheetname
        }, function(err, result) {
            if (err) {
                console.error(err);
            } else {
                originalEdges = result;

                let yearlyData = d3.nest()
                    .key(function(d) { return d.year; })
                    .entries(originalEdges);

                yearlyData.forEach(function(y) {
                    console.log(y.key)
                    let repeated_nodes = [];
                    graph[y.key] = {
                        'nodes': [],
                        'edges': []
                    }
                    let nestedEdges = d3.nest()
                        .key(function(d) { return d.source })
                        .key(function(d) { return d.target })
                        .entries(y.values)

                    // console.log(JSON.stringify(nestedEdges,null,4))

                    nestedEdges.forEach(function(e) {
                        let thisSource = e.key;

                        repeated_nodes.push(thisSource);

                        e.values.forEach(function(f) {
                            let thisTarget = f.key;
                            repeated_nodes.push(thisTarget);
                            let thisWeight = f.values.length;
                            let theseTargetInstitutions = [];
                            f.values.forEach(function(g) {
                                if (g.target_institution != "") {
                                    theseTargetInstitutions.push(g.target_institution);
                                }
                            })
                            var thisEdge = {
                                'source': thisSource,
                                'target': thisTarget,
                                'weight': thisWeight,
                                'target_institutions': theseTargetInstitutions
                            }
                            graph[y.key].edges.push(thisEdge);
                        })
                    })

                    let nodesCount = _.countBy(repeated_nodes, _.identity);

                    // prepare data for out degrees
                    let edgesNestedOnSources = d3.nest()
                        .key(function(d){ return d.source })
                        .rollup(function(d){ return d.length })
                        .entries(graph[y.key].edges);

                    // prepare data for in degrees
                    let edgesNestedOnTargets = d3.nest()
                        .key(function(d){ return d.target })
                        .rollup(function(d){ return d.length })
                        .entries(graph[y.key].edges);

                    Object.keys(nodesCount).forEach(function(d) {
                        let thisNode = originalNodes.filter(function(e) {
                            return e.id == d
                        })[0];
                        thisNode.count = nodesCount[d];

                        // Get in degree
                        thisNode.inDegree = 0;
                        let thisInDegree = edgesNestedOnTargets.filter(function(f) { 
                            return f.key == d;
                        })
                        if (thisInDegree.length > 0) {
                           thisNode.inDegree = thisInDegree[0].value;
                        }

                        // Get out degree
                        thisNode.outDegree = 0;
                        let thisOutDegree = edgesNestedOnSources.filter(function(f) { 
                            return f.key == d;
                        })
                        if (thisOutDegree.length > 0) {
                           thisNode.outDegree = thisOutDegree[0].value;
                        }
                        graph[y.key].nodes.push(thisNode);
                    })

                    graph[y.key].nodes.sort(function(a, b) {
                        if (a.concordat < b.concordat) return -1;
                        if (a.concordat > b.concordat) return 1;
                        return 0;
                    })

                    graph[y.key].edges.forEach(function(d) {
                        let indexSource = graph[y.key].nodes.findIndex(function(n) {
                            return n.id == d.source
                        })
                        let indexTarget = graph[y.key].nodes.findIndex(function(n) {
                            return n.id == d.target
                        })
                        // console.log(d.source, indexSource, ' - ', d.target, indexTarget)
                        d.sourceName = d.source;
                        d.targetName = d.target;
                        d.source = indexSource;
                        d.target = indexTarget;
                    })

                })

                fs.writeFile("./data/cantons-network.json", JSON.stringify(graph, null, 2), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                });
            }
        });
    }
});