const fs = require('fs');
const node_xj = require("xls-to-json");
const d3 = require('d3');

node_xj({
    input: "data/datasetLaws.xlsx", // input xls
    output: null, // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        // console.log(result);
        let finalArray = [];

        //split each institution with more than one typology so they can then be filtered in the viz
        result.forEach(function(el){
            // console.log(el.issue_date);
            let parsedIssueDate = null,
                parsedInforceDate = null,
                parsedRepealDate = null,
                typology;

            if (el.issue_date.indexOf('.') != -1) {
                let dateArray = el.issue_date.split('.');
                parsedIssueDate = dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
            } else if (el.issue_date.indexOf('/') != -1) {
                let dateArray = el.issue_date.split('/');
                parsedIssueDate = '19' + dateArray[2] + '-' + dateArray[0] + '-' + dateArray[1];
            } else {
                parsedIssueDate = el.issue_date + '-01-01';
            }

            if (el.inforce_date != '') {
                if (el.inforce_date.indexOf('.') != -1) {
                    let dateArray = el.inforce_date.split('.');
                    parsedInforceDate = dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
                } else if (el.inforce_date.indexOf('/') != -1) {
                    let dateArray = el.inforce_date.split('/');
                    parsedInforceDate = '19' + dateArray[2] + '-' + dateArray[0] + '-' + dateArray[1];
                } else {
                    parsedInforceDate = el.inforce_date + '-01-01';
                }
            }

            if (el.repeal_date != '') {
                if (el.repeal_date.indexOf('.') != -1) {
                    let dateArray = el.repeal_date.split('.');
                    parsedRepealDate = dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
                } else if (el.repeal_date.indexOf('/') != -1) {
                    let dateArray = el.repeal_date.split('/');
                    parsedRepealDate = '19' + dateArray[2] + '-' + dateArray[0] + '-' + dateArray[1];
                } else {
                    parsedRepealDate = el.repeal_date + '-01-01';
                }
            }

            switch (+el.typology) {
                case 1:
                    typology = 'Recht';
                    break;
                case 2:
                    typology = 'Gesetz';
                    break;
                case 3:
                    typology = 'Verordnung';
                    break;
                case 4:
                    typology = 'Erlass';
                    break;
                case 5:
                    typology = 'Dekret';
                    break;
                case 6:
                    typology = 'Vertrag';
                    break;
                case 7:
                    typology = 'keine Angabe';
                    break;
                default:
                    typology = null;
            }

            let institution = {
                'id': el.id,
                'canton': el.canton,
                'issue_date': parsedIssueDate,
                'inforce_date': parsedInforceDate,
                'repeal_date': parsedRepealDate,
                'title': el.title,
                'articles': el.articles,
                'typology': typology,
                'range': el.range,
                'original_issue_date': el.issue_date,
                'original_inforce_date': el.inforce_date,
                'original_repeal_date': el.repeal_date
            }
            finalArray.push(institution);
        });
        // console.log(finalArray);

        fs.writeFile("./data/glossary-laws.json", JSON.stringify(finalArray), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
});
