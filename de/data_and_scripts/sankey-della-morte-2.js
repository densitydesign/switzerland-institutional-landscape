const fs = require('fs');
const node_xj = require("xls-to-json");
const d3 = require('d3');
const _ = require('lodash');

node_xj({
    input: "data/master-dataset.xlsx", // input xls
    output: null, // output json
    sheet: "sankey" // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {

        let dataRAW = JSON.parse(fs.readFileSync('data/data-sankey-from-raw.json').toString());

        // Use the data generated with RAWGraphs to search against the original dataset
        // and find the list of facilities corresponding to each specific rectangle or flow
        // belonging to the sanky chart.

        dataRAW.nodes.forEach(function(d) {

            let list = result.filter(function(e) {
                return e['s' + d.group] == d.name;
            })

            list = list.map(function(e) {
                return e.id;
            })

            d.list = list;

        });

        dataRAW.links.forEach(function(d,i){
        	let flowing = _.intersection(dataRAW.nodes[d.source].list, dataRAW.nodes[d.target].list);
        	d.list = flowing;
        })

        fs.writeFile("./data/sankey-institutions-with-list.json", JSON.stringify(dataRAW, null, null), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });

    }
});