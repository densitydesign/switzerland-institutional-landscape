const fs = require('fs');
const _ = require('lodash');
const node_xj = require("xls-to-json");

node_xj({
    input: "data/master-dataset-13-nov.xlsx", // input xls
    output: null, // output json
    // sheet: "sheetname"  // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        let repeatedNodes = [],
            nodes = [],
            repeatedEdges = [],
            edges = [];

        result.forEach(d => {
            d.typologies = d.typologies.split(';');
            repeatedNodes = _.concat(repeatedNodes, d.typologies);

            if (d.typologies.length > 1) {
                repeatedEdges = _.concat(repeatedEdges, k_combinations(d.typologies, 2))
            }
        })

        let obj = _.countBy(repeatedNodes, _.identity);

        Object.keys( obj ).forEach(function(key,i) {

            let id;
            if (key == 'forced labour institution (restricted)') {
                id = 1;
            } else if (key == 'forced labour institution (semi-open)') {
                id = 2;
            } else if (key == 'educational institution)') {
                id = 3;
            } else if (key == 'asylum for alcoholics') {
                id = 4;
            } else if (key == 'prison') {
                id = 5;
            } else if (key == 'psychiatric facility') {
                id = 6;
            } else if (key == 'poor house') {
                id = 7;
            } else if (key == 'institution for people with special needs') {
                id = 8;
            }

            let t = {
                'id': id,
                'label': key,
                'count': obj[key]
            }

            nodes.push(t);

        });


        obj = _.countBy(repeatedEdges, _.identity);

        Object.keys( obj ).forEach(function(key,i) {

            let e = {
                'source': key.split(',')[0],
                'target': key.split(',')[1],
                'weight': obj[key]
            }

            nodes.forEach(function(f){
                e.source = e.source.replace(f.label,f.id);
                e.target = e.target.replace(f.label,f.id);
            })

            edges.push(e);

        });

        let graph = {
            'nodes': nodes,
            'edges': edges
        }



        fs.writeFile("./data/typologies-graph.json", JSON.stringify(graph, null, null), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
});

// {
//     7'poor house': 316,
//     3'educational institution': 263,
//     2'forced labour institution (semi-open)': 41,
//     4'asylum for alcoholics': 66,
//     6'psychiatric facility': 68,
//     1'forced labour institution (restricted)': 100,
//     5'prison': 650,
//     8'institution for people with special needs': 27
// }


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


function k_combinations(set, k) {
    var i, j, combs, head, tailcombs;

    // There is no way to take e.g. sets of 5 elements from
    // a set of 4.
    if (k > set.length || k <= 0) {
        return [];
    }

    // K-sized set has only one K-sized subset.
    if (k == set.length) {
        return [set];
    }

    // There is N 1-sized subsets in a N-sized set.
    if (k == 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }

    // Assert {1 < k < set.length}

    // Algorithm description:
    // To get k-combinations of a set, we want to join each element
    // with all (k-1)-combinations of the other elements. The set of
    // these k-sized sets would be the desired result. However, as we
    // represent sets with lists, we need to take duplicates into
    // account. To avoid producing duplicates and also unnecessary
    // computing, we use the following approach: each element i
    // divides the list into three: the preceding elements, the
    // current element i, and the subsequent elements. For the first
    // element, the list of preceding elements is empty. For element i,
    // we compute the (k-1)-computations of the subsequent elements,
    // join each with the element i, and store the joined to the set of
    // computed k-combinations. We do not need to take the preceding
    // elements into account, because they have already been the i:th
    // element so they are already computed and stored. When the length
    // of the subsequent list drops below (k-1), we cannot find any
    // (k-1)-combs, hence the upper limit for the iteration:
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        // head is a list that includes only our current element.
        head = set.slice(i, i + 1);
        // We take smaller combinations from the subsequent elements
        tailcombs = k_combinations(set.slice(i + 1), k - 1);
        // For each (k-1)-combination we join it with the current
        // and store it to the set of k-combinations.
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}
