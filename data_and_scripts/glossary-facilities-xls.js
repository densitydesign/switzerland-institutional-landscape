const fs = require('fs');
const node_xj = require("xls-to-json");
const d3 = require('d3');
const _ = require('lodash');

console.log('yo')

node_xj({
    input: "data/glossary-facilities/ids-correspondences.xlsx", // input xls
    output: 'data/glossary-facilities.json', // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, ids) {
    if (err) {
        console.error(err);
    } else {
        // console.log(ids);
        ids = ids.map(function(d) {
            return {
                'id': d.id,
                'old_id': d.old_id,
                'survey': d.survey_year
            }
        });

        ids = d3.nest()
            .key(function(d) { return d.id })
            .key(function(d) { return d.survey })
            .entries(ids)

        // console.log(ids[1]);

        node_xj({
            input: "data/master-dataset.xlsx", // input xls
            output: 'data/masterx.json', // output json
            sheet: "data" // specific sheetname
        }, function(err, master) {
            if (err) {
                console.error(err);
            } else {
                // console.log(master);

                let top1933 = fs.readFileSync('data/glossary-facilities/top1933.txt', 'utf8')
                    .toString();
                top1933 = d3.tsvParse(top1933);

                let top1940 = fs.readFileSync('data/glossary-facilities/top1940.txt', 'utf8')
                    .toString();
                top1940 = d3.tsvParse(top1940);

                let top1954 = fs.readFileSync('data/glossary-facilities/top1954.txt', 'utf8')
                    .toString();
                top1954 = d3.tsvParse(top1954);

                let top1965 = fs.readFileSync('data/glossary-facilities/top1965.txt', 'utf8')
                    .toString();
                top1965 = d3.tsvParse(top1965);

                let top1980 = fs.readFileSync('data/glossary-facilities/top1980.txt', 'utf8')
                    .toString();
                top1980 = d3.tsvParse(top1980);

                master.forEach(function(d) {

                    let old_id = ids.filter(function(e) { return e.key == d.id })[0]

                    d.sources = [];

                    //Do 1933
                    let id33 = old_id.values.filter(function(e) { return e.key == '1933' })
                    if (id33.length) {

                        let source33 = {
                            'reference': 'File topography 1933',
                            'purpose': 'File «topography 1933», column O',
                            'capacities': 'File «topography 1933», column Q',
                            'categories': 'File «topography 1933», column S'
                        }

                        id33 = id33[0].values[0].old_id;

                        var data33 = top1933.filter(function(e) {
                            return e['ID'] == id33
                        })[0]

                        source33.purpose = data33[Object.keys(data33)[14]];
                        source33.capacities = data33[Object.keys(data33)[16]];
                        source33.categories = data33[Object.keys(data33)[18]];

                        d.sources.push(source33);

                    }


                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    // Proseguire con gli altri anni sulla falsa riga del 33
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 
                    // 


                })
                fs.writeFile("./data/master-glossary.json", JSON.stringify(master, null, 2), 'utf8', function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                });
            }
        });

    }
});