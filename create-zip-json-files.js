const beautify = require('js-beautify').js_beautify;
const fs = require('fs');
const mkdirp = require('mkdirp');
const parse = require('csv-parse/lib/sync');


function getCSV(name, delimiter = ',') {
    const text = fs
        .readFileSync(`csv/${name}.csv`, 'utf-8')
        .trim()
        .split('\n')
        .filter(line => new RegExp(delimiter).test(line))
        .join('\n');

    const data = parse(text, {
        columns: true,
        delimiter: delimiter,
    });

    return data;
}

const statesByAbbrev = {};
const statesById = [];
getCSV('states', '|').forEach(state => {
    const abbrev = state['STUSAB'];
    const id = +state['STATE'];
    const data = {
        abbrev,
        districts: {},
        id,
        senators: [],
    };
    statesByAbbrev[abbrev] = data;
    statesById[id] = data;
});

getCSV('legislators', ',').forEach(legislator => {
    if (legislator.in_office !== '1') {
        return;
    }

    const state = statesByAbbrev[legislator.state];
    if (legislator.title === 'Sen') {
        state.senators.push(legislator);
    } else {
        const d = legislator.district;
        const districts = state.districts;
        districts[d] = districts[d] || [];
        districts[d].push(legislator);
    }
});

mkdirp.sync('json');

getCSV('zips', ',').forEach(zip => {
    const code = +zip.ZCTA;
    const district = +zip['Congressional District'];
    const state = statesById[+zip.State];
    const rep = state.districts[district] || [];
    const senators = state.senators || [];
    const data = rep.concat(senators);
    fs.writeFileSync(`json/${code}.json`, beautify(JSON.stringify(data)));
});
