const fs = require('fs');
const node_xj = require("xls-to-json");

node_xj({
    input: "data/master-dataset-13-nov.xlsx", // input xls
    output: null, // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        let finalArray = [];

        //filter only the institutions for 1954, 1965, 1980
        result.forEach(function(el){
            if (el.survey_year === '1954' || el.survey_year === '1965' || el.survey_year === '1980') {
                let institution = {
                    'id': el.id,
                    'survey_year': el.survey_year,
                    'lon': el.longitude,
                    'lat': el.latitude,
                    'capacity_group': el.capacity_group,
                    'confession': el.confession,
                    'accepted_gender': el.accepted_gender
                }
                finalArray.push(institution);
            }
        });

        // console.log(finalArray);
        fs.writeFile("./data/map_cap-con-gen.json", JSON.stringify(finalArray), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
});
