const fs = require('fs');
const node_xj = require("xls-to-json");

node_xj({
    input: "data/master-dataset-10-nov.xlsx", // input xls
    output: null, // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        // console.log(result);
        result = result.map(function(d) {
            return {
                'id': d.id,
                'survey_year': d.survey_year,
                'lon': d.longitude,
                'lat': d.latitude,
                'accepted_gender': d.accepted_gender
            }
        })
        // console.log(result);
        fs.writeFile("./data/map_genders.json", JSON.stringify(result), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
});
