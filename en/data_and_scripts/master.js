const fs = require('fs');
const node_xj = require("xls-to-json");

node_xj({
    input: "data/master-dataset.xlsx", // input xls
    output: 'data/master.json', // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        console.log(result)
        // result = result.map(function(d) {
        //     return {
        //         'id': d.id,
        //         'survey_year': d.survey_year,
        //         'typologies': d.typologies,
        //         'group': d.typologies.split(';').length,
        //         'capacity_group': d.capacity_group
        //     }
        // })
        // fs.writeFile("./data/timeline.json", JSON.stringify(result, null, null), function(err) {
        //     if (err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // });
    }
});

// {
//     committing_agencies: 'not specified',
//     id: 'AG47',
//     status: '',
//     name_landmark: 'Gemeindearmenhaus ohne gemeinschaftlichen Haushalt',
//     canton_code: 'AG',
//     canton: 'Aargau',
//     latitude: '47.4998388',
//     longitude: '8.0646316',
//     opened: 'before 1933',
//     opened_alternative: '',
//     closed: 'unknown',
//     closed_alternative: '',
//     survey_year: '1933',
//     city: 'Hornussen',
//     institution: 'Gemeindearmenhaus ohne gemeinschaftlichen Haushalt',
//     typologies: 'poor house;',
//     confession: 'not specified',
//     capacity: '',
//     capacity_group: 'not specified',
//     accepted_gender: 'both genders',
//     funding_agency: 'not specified'
// }
