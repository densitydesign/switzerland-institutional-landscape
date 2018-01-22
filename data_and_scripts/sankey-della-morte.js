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

        result = result.map(function(d) {
            return {
                'id': d.id,
                // 'opened': d.opened,
                // 'closed': d.closed,
                '1933': d.s1933,
                '1940': d.s1940,
                '1954': d.s1954,
                '1965': d.s1965,
                '1980': d.s1980
            }
        })

        // console.log(result);

        // fs.writeFile("./data/sankey-institutions.json", JSON.stringify(result, null, null), function(err) {
        //     if (err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // });

        // The data has then to be reworked in RAWGraphs, using the alluvial diagram (sankey) and exporting the JSON data format

        // REWORK THE DATA IN RAWGRAPHS, THEN EXECUTE "sankey-della-morte-2.js"


    }
});


// { to_check: '',
//     id: 'AG01',
//     opened: '1803',
//     closed: 'unknown',
//     s1933: 'surveyed',
//     s1940: 'uncertain',
//     s1954: 'uncertain',
//     s1965: 'uncertain',
//     s1980: 'uncertain'
// },


// uncertain
// closed
// open
// surveyed