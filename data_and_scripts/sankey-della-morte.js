const fs = require('fs');
const node_xj = require("xls-to-json");
const d3 = require('d3');
const _ = require('lodash');

node_xj({
    input: "data/master-dataset.xlsx", // input xls
    output: null, // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {

        let openedTimes = d3.nest()
            .key(function(d) {
                return d.opened;
            })
            .entries(result)

        openedTimes = openedTimes.map(function(d) {
            return d.key;
        })

        openedTimes = _.remove(openedTimes, function(n) {
            return isNaN(n);
        });

        console.log('opened options', openedTimes, '\n');

        let closedTimes = d3.nest()
            .key(function(d) {
                return d.closed;
            })
            .entries(result);

        closedTimes = closedTimes.map(function(d) {
            return d.key;
        })

        closedTimes = _.remove(closedTimes, function(n) {
            return isNaN(n);
        });

        console.log('closed options', closedTimes, '\n');



        let data = d3.nest()
            .key(function(d) { return d.id; })
            // .key(function(d) { return d.survey_year; })
            .rollup(function(d) {
                let obj = {
                    s1933: undefined,
                    s1940: undefined,
                    s1954: undefined,
                    s1965: undefined,
                    s1980: undefined
                }

                obj.s1933 = d.filter(function(e) {
                    return e.survey_year == 1933
                })[0] ? true : undefined

                obj.s1940 = d.filter(function(e) {
                    return e.survey_year == 1940
                })[0] ? true : undefined

                obj.s1954 = d.filter(function(e) {
                    return e.survey_year == 1954
                })[0] ? true : undefined

                obj.s1965 = d.filter(function(e) {
                    return e.survey_year == 1965
                })[0] ? true : undefined

                obj.s1980 = d.filter(function(e) {
                    return e.survey_year == 1980
                })[0] ? true : undefined

                Object.keys(obj).forEach(function(e) {
                    if (!obj[e]) {
                        let opened = d[0].opened;
                        let openedState = undefined;
                        let closed = d[0].closed;
                        let closedState = undefined;

                        let state = 'uncertain';

                        // console.log(d[0].id + '-'+ e + '\t' + opened + '\t\t' + closed);

                        // let opened_options = [ 
                        // 'before 1895',
                        // 'before 1909',
                        // 'before 1915',
                        // 'before 1919',
                        // 'Um 1920',
                        // 'before 1933',

                        // 'before 1939',
                        // 'before 1940',
                        // 'before 1954',
                        // 'before 1965',
                        // 'after 1966',
                        // 'before 1980',
                        // ] 

                        // let closed_options = [
                        // 'after 1922', u

                        // 'after 1933',
                        // 'after 1939',
                        // 'after 1940',
                        // 'after 1945',
                        // 'after 1954',
                        // 'before 1954', u
                        // 'after 1965',
                        // 'ca. 1970',
                        // 'after 1971',
                        // 'after 1972',
                        // 'after 1980',
                        // 'after1980',
                        // 'after 1981',
                        // 'before 1965', u
                        // 'not specified', u
                        // 'unknown' u
                        // ]

                        if (e == 's1933') {
                            // open but not surveyed
                            if (opened == 'before 1985' || opened == 'before 1909' || opened == 'before 1915' || opened == 'before 1919' || opened == 'Um 1920' || opened == 'before 1933') {
                                if (closed == 'after 1933' || closed == 'after 1939' || closed == 'after 1940' || closed == 'after 1945' || closed == 'after 1965' || closed == 'ca. 1970' || closed == 'after 1945' || closed == 'after 1971' || closed == 'after 1972' || closed == 'after 1980' || closed == 'after1980' || closed == 'after 1981') {
                                    state = 'open but not surveyed';
                                }
                            }
                            // closed
                            else if (opened == 'after 1966'){
                                state = 'closed';
                            }
                            // uncertain
                            else if (opened == 'before 1939' || opened ==  'before 1940' || opened ==  'before 1954' || opened ==  'before 1965' || opened ==  'before 1980') {
                                state = 'uncertain'
                            } else {
                                state = 'CHECK THE CODE';
                            }
                        }

                    obj[e] = state
                    console.log(d[0].id,state)
                    }
                })
            return obj;
            })
            .entries(result);

        console.log(data[1]);






        // fs.writeFile("./data/bubblechart.json", JSON.stringify(result, null, null), function(err) {
        //     if (err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // });
    }
});






// uncertain
// closed
// open but not surveyed
// open and surveyed


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