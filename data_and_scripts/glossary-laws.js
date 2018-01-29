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
            // console.log(el);
            let dotParse = d3.timeParse("%d.%m.%Y"),
                slashParse = d3.timeParse("%d/%m/%Y"),
                yearParse = d3.timeParse("%Y"),
                parsedIssueDate = null,
                parsedInforceDate = null,
                parsedRepealDate = null,
                typology;

            if (el.issue_date.indexOf('.') != -1) {
                parsedIssueDate = dotParse(el.issue_date);
            } else if (el.issue_date.indexOf('/') != -1) {
                let newDate = el.issue_date.replace(/(\d\d)$/, '19$1');
                parsedIssueDate = slashParse(newDate);
            } else {
                parsedIssueDate = yearParse(el.issue_date);
            }

            if (el.inforce_date != '') {
                if (el.inforce_date.indexOf('.') != -1) {
                    parsedInforceDate = dotParse(el.inforce_date);
                } else if (el.inforce_date.indexOf('/') != -1) {
                    let newDate = el.inforce_date.replace(/(\d\d)$/, '19$1');
                    parsedInforceDate = slashParse(newDate);
                } else {
                    parsedInforceDate = yearParse(el.inforce_date);
                }
            }

            if (el.repeal_date != '') {
                if (el.repeal_date.indexOf('.') != -1) {
                    parsedRepealDate = dotParse(el.repeal_date);
                } else if (el.repeal_date.indexOf('/') != -1) {
                    let newDate = el.repeal_date.replace(/(\d\d)$/, '19$1');
                    parsedRepealDate = slashParse(newDate);
                } else {
                    parsedRepealDate = yearParse(el.repeal_date);
                }
            }

            switch (+el.typology) {
                case 1:
                    typology = 'law';
                    break;
                case 2:
                    typology = 'act';
                    break;
                case 3:
                    typology = 'regulation';
                    break;
                case 4:
                    typology = 'enactment';
                    break;
                case 5:
                    typology = 'decree';
                    break;
                case 6:
                    typology = 'contract';
                    break;
                case 7:
                    typology = 'not specified';
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
                'range': el.range
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
