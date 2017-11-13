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

        //split each institution with more than one typology so they can then be filtered in the viz
        result.forEach(function(el){
            if (el.survey_year === '1954' || el.survey_year === '1965' || el.survey_year === '1980') {
                let typologyArray = el.typologies.split(';');

                for (let i = 0; i < typologyArray.length; i++) {
                    let institution = {
                        'id': el.id,
                        'survey_year': el.survey_year,
                        'lon': el.longitude,
                        'lat': el.latitude,
                        'typology': typologyArray[i]
                    };

                    finalArray.push(institution);
                }
            }
        });
        // console.log(finalArray);
        fs.writeFile("./data/map_typologies.json", JSON.stringify(finalArray), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
});
