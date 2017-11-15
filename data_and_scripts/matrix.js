const fs = require('fs');
const node_xj = require("xls-to-json");

const categories = JSON.parse(fs.readFileSync('data/matrix-categories.json', 'utf8'));

node_xj({
    input: "data/master-dataset-13-nov.xlsx", // input xls
    output: null, // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        // console.log(result);
        let finalArray = [];

        // transform every category to an array and then map each to a numeric value
        result.forEach(function(el){
            // console.log(el);
            if (el.survey_year === '1954' || el.survey_year === '1965' || el.survey_year === '1980') {
                let capacityArray = el.capacity_group.split(';'),
                    committingAgencyArray = el.committing_agencies.split(';'),
                    confessionArray = el.confession.split(';'),
                    fundingAgencyArray = el.funding_agency.split(';'),
                    genderArray = el.accepted_gender.split(';'),
                    typologyArray = el.typologies.split(';');

                capacityArray = capacityArray.map(function(i){
                    return categories.capacity[i];
                });
                committingAgencyArray = committingAgencyArray.map(function(i){
                    return categories.committingAgency[i];
                });
                confessionArray = confessionArray.map(function(i){
                    return categories.confession[i];
                });
                fundingAgencyArray = fundingAgencyArray.map(function(i){
                    return categories.fundingAgency[i];
                });
                genderArray = genderArray.map(function(i){
                    return categories.gender[i];
                });
                typologyArray = typologyArray.map(function(i){
                    return categories.typology[i];
                });

                let institution = {
                    'id': el.id,
                    'survey_year': el.survey_year,
                    'capacity_group': capacityArray,
                    'committing_agencies': committingAgencyArray,
                    'confession': confessionArray,
                    'funding_agency': fundingAgencyArray,
                    'accepted_gender': genderArray,
                    'typology': typologyArray
                };

                finalArray.push(institution);
            }
        });
        // console.log(finalArray);
        fs.writeFile("./data/matrix.json", JSON.stringify(finalArray), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
});
