const fs = require('fs');
const node_xj = require("xls-to-json");
const d3 = require('d3');
const _ = require('lodash');

console.log('yo')

node_xj({
    input: "data/glossary-facilities/ids-correspondences.xlsx", // input xls
    output: null, // output json
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
            output: null, // output json
            sheet: "data" // specific sheetname
        }, function(err, master) {
            if (err) {
                console.error(err);
            } else {
                // console.log(master);

                let top1933 = fs.readFileSync('data/glossary-facilities/top1933-utf8.tsv', 'utf8')
                    .toString();
                top1933 = d3.tsvParse(top1933);

                let top1940ies = fs.readFileSync('data/glossary-facilities/top1940ies-utf8.tsv', 'utf8')
                    .toString();
                top1940ies = d3.tsvParse(top1940ies);

                let top1954 = fs.readFileSync('data/glossary-facilities/top1954-utf8.tsv', 'utf8')
                    .toString();
                top1954 = d3.tsvParse(top1954);

                let top1965 = fs.readFileSync('data/glossary-facilities/top1965-utf8.tsv', 'utf8')
                    .toString();
                top1965 = d3.tsvParse(top1965);

                let top1980 = fs.readFileSync('data/glossary-facilities/top1980-utf8.tsv', 'utf8')
                    .toString();
                top1980 = d3.tsvParse(top1980);
                
                
                // console.log(top1933[0])
                Object.keys(top1980[0]).forEach(function(d,i){
                    console.log('---',i);
                    console.log(d)
                    console.log('\n');

                })


                master.forEach(function(d,i) {

                    let old_id = ids.filter(function(e) { return e.key == d.id })[0]

                    d.sources = [];

                    //Do 1933
                    let id33 = old_id.values.filter(function(e) { return e.key == '1933' })
                    if (id33.length) {

                        let source33 = {
                            'source_year': '1933',
                            'reference': 'File topography 1933',
                            'purpose': 'File «topography 1933», column O',
                            'capacities': 'File «topography 1933», column Q',
                            'categories': 'File «topography 1933», column S'
                        }

                        id33 = id33[0].values[0].old_id;

                        var data33 = top1933.filter(function(e) {
                            return e.ID == id33
                        })[0]


                        source33.purpose = data33['Zweck (purpose of the institution)'];
                        source33.capacities = data33['Plätze (capacities)'];
                        source33.categories = data33['Kategorie (categories as shown in the original sources)'];

                        d.sources.push(source33);
                    }

                    //Do 1940
                    let id40ies = old_id.values.filter(function(e) { return e.key == '1940' })
                    if (id40ies.length) {

                        let source40ies = {
                            'source_year': '1940ies',
                            'reference': 'File «topography 1940ies»',
                            // 'purpose': 'File «topography 1940ies», columns I, K and L (without column M). Abbrevations must be decripted.',
                            // 'capacities': 'File «topography 1940ies», columns S to V (without column W)',
                            // 'categories': 'File «topography 1940ies», column J'
                        }

                        

                        let categories = `Zweck 1945 (Quelle) ZH=Zuchthaus, G=Gefängnis, H=Haft, V=Verwahrung für Gewohnheitsverbrecher, A=Arbeitserziehungsanstalt, T=Trinkerheilanstalt); purpose of the institution according to the source 1945`;

                        id40ies = id40ies[0].values[0].old_id;

                        var data40ies = top1940ies.filter(function(e) {
                            return e.ID == id40ies
                        })[0]

                        // Purposes

                        let purpose_source1933 = `Zweck 1933 (Quelle); purpose of the institution according to the source 1933 (Wild Albert)`;
                        source40ies.purpose_source1933 = data40ies[purpose_source1933];

                        let purpose_source1944 = `Zweck/Spezifikation Pro Juventute 1944; purpose of the institution according to the source 1944`;
                        source40ies.purpose_source1944 = data40ies[purpose_source1944];

                        let purpose_source1945 = `Zweck 1945 (Quelle) ZH=Zuchthaus, G=Gefängnis, H=Haft, V=Verwahrung für Gewohnheitsverbrecher, A=Arbeitserziehungsanstalt, T=Trinkerheilanstalt); purpose of the institution according to the source 1945`;

                        source40ies.purpose_source1945 = data40ies[purpose_source1945] + ',';

                        source40ies.purpose_source1945 = source40ies.purpose_source1945
                            .replace('ZH,','Zuchthaus,')
                            .replace('G,','Gefängnis,')
                            .replace('H,','Haft,')
                            .replace('V,','Verwahrung für Gewohnheitsverbrecher,')
                            .replace('A,','Arbeitserziehungsanstalt,')
                            .replace('T,','Trinkerheilanstalt,')

                        // Capacities

                        let capacities_source1933 = `Platzzahl (capacieties according to source) 1933 (Quelle)`
                        source40ies.capacities_source1933 = data40ies[capacities_source1933];

                        let capacities_source1939 = `Platzzahl (capacities according to source) 1939 (Quelle)`
                        source40ies.capacities_source1939 = data40ies[capacities_source1939];

                        let capacities_source1944 = `Platzzahl (capacities according to source) Pro Juventute 1944 (Quelle)`
                        source40ies.capacities_source1944 = data40ies[capacities_source1944];

                        let capacities_source1945 = `Platzzahl (capacities according to source) 1945 (Quelle)`
                        source40ies.capacities_source1945 = data40ies[capacities_source1945];

                        // Categories

                        source40ies.categories = data40ies[categories];

                        d.sources.push(source40ies);
                    }

                    //Do 1954
                    let id54 = old_id.values.filter(function(e) { return e.key == '1954' })
                    if (id54.length) {

                        let source54 = {
                            'source_year': '1954',
                            'reference': 'File «topography 1954»',
                            // 'purpose': 'File «topography 1954», columns F and column Z',
                            // 'capacities': 'File «topography 1954», column R',
                            // 'categories': 'File «topography 1954», column O'
                        }

                        id54 = id54[0].values[0].old_id;

                        var data54 = top1954.filter(function(e) {
                            return e.ID == id54
                        })[0]

                        let purpose1 = `Anstaltszweck (Quelle) (purpos of the institution according to the source)`;
                        source54.purpose1 = data54[purpose1]


                        let purpose2 = `Anstaltstypen: Arbeitsanstalt = 1; Arbeiterkolonie = 2; Erziehungsanstalt = 3; Trinkerheilanstalt = 4; Strafanstalt = 5; Psychiatrische Einrichtung = 6; Armenhaus = 7; Sonderanstalt = 8`;
                        source54.purpose2 = data54[purpose2];

                        source54.purpose2 = source54.purpose2
                            .replace('1','Arbeitsanstalt')
                            .replace('2','Arbeiterkolonie')
                            .replace('3','Erziehungsanstalt')
                            .replace('4','Trinkerheilanstalt')
                            .replace('5','Strafanstalt')
                            .replace('6','Psychiatrische Einrichtung')
                            .replace('7','Armenhaus')
                            .replace('8','Sonderanstalt')

                        source54.capacities = data54['Platzzahl (Quelle) (capacities according to source)'];
                        source54.categories = data54['Spezifikation Typologie (Quelle) (categories according to source)'];

                        d.sources.push(source54);
                    }

                    //Do 1965
                    let id65 = old_id.values.filter(function(e) { return e.key == '1965' })
                    if (id65.length) {

                        let source65 = {
                            'source_year': '1965',
                            'reference': 'File «topography 1965»',
                            // 'purpose': 'File «topography 1965», columns E and R',
                            'capacities': 'File «topography 1965», column K',
                            'categories': ''
                        }

                        id65 = id65[0].values[0].old_id;

                        var data65 = top1965.filter(function(e) {
                            return e.ID == id65
                        })[0]

                        let purpose1 = `Anstaltszweck (Quelle)`;
                        source65.purpose1 = data65[purpose1];

                        let purpose2 = `Aufenthaltsbedingungen (Quelle) (terms of detention e.g. duration of stay/juridic coverage according to source)`;
                        source65.purpose2 = data65[purpose2];

                        source65.capacities = data65['Platzzahl (Quelle) (capacities according to source)'];

                        // source65.categories = data65['Kategorie (categories as shown in the original sources)'];

                        d.sources.push(source65);
                    }

                    //Do 1980
                    let id80 = old_id.values.filter(function(e) { return e.key == '1980' })
                    if (id80.length) {

                        let source80 = {
                            'source_year': '1980',
                            'reference': 'File «topography 1980»',
                            // 'purpose': 'File «topography 1980», columns J, N and T',
                            'capacities': 'File «topography 1980», column P',
                            'categories': 'File «topography 1980», column S'
                        }

                        id80 = id80[0].values[0].old_id;

                        var data80 = top1980.filter(function(e) {
                            return e.ID == id80
                        })[0]

                        let purpose1 = `Anstaltszweck (purpose of the institution according to source)`;
                        source80.purpose1 = data80[purpose1];

                        let purpose2 = `1. Geschichtliches (historical facts according to source)`;
                        source80.purpose2 = data80[purpose2];

                        let purpose3 = `6. Vollzugskonzept (methods and concept of conducting measures)`;
                        source80.purpose3 = data80[purpose3];

                        source80.capacities = data80['Plätze (capacity according to source)'];
                        
                        source80.categories = data80["5. Aufgaben (institution's purpose and tasks according to source)"];

                        d.sources.push(source80);
                    }




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


                // let top1940 = fs.readFileSync('data/glossary-facilities/top1940.txt', 'utf8')
                //     .toString();
                // top1940 = d3.tsvParse(top1940);

                // let top1954 = fs.readFileSync('data/glossary-facilities/top1954.txt', 'utf8')
                //     .toString();
                // top1954 = d3.tsvParse(top1954);

                // let top1965 = fs.readFileSync('data/glossary-facilities/top1965.txt', 'utf8')
                //     .toString();
                // top1965 = d3.tsvParse(top1965);

                // let top1980 = fs.readFileSync('data/glossary-facilities/top1980.txt', 'utf8')
                //     .toString();
                // top1980 = d3.tsvParse(top1980);