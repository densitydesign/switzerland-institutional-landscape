const fs = require('fs');
const node_xj = require("xls-to-json");

node_xj({
    input: "data/master-dataset-9-nov.xlsx", // input xls
    output: null, // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        result = result.map(function(d) {
            return {
                'id': d.id,
                'survey_year': d.survey_year,
                'typologies': d.typologies,
                'group': d.typologies.split(';').length
            }
        })
        fs.writeFile("./data/timeline.json", JSON.stringify(result, null, null), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
});
