const $ = require('cheerio');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');


let csv = 'title,firstname,lastname,party,state,district,in_office,phone,bioguide_id\n';

Promise.resolve()

// House of Representatives
.then(() => request('http://clerk.house.gov/xml/lists/MemberData.xml'))
.then(data => {
    console.log(chalk.green('House of Representatives'));
    const house = parseXML(data);
    house.find('members member').each((i, member) => {
        const $member = $(member);

        if ($member.find('predecessor-info').length > 0) {
            return;
        }

        csv += [
            'Rep',
            $member.find('firstname').text(),
            $member.find('lastname').text(),
            $member.find('party').text(),
            $member.find('statedistrict').text().slice(0, 2),
            +$member.find('statedistrict').text().slice(2),
            1,
            $member.find('phone').text().replace(/[()]/g, '').replace(/ /g, '-'),
            $member.find('bioguideID').text(),
        ].join(',') + '\n';
    });
})

// Senate
.then(() => request('http://www.senate.gov/general/contact_information/senators_cfm.xml'))
.then(data => {
    console.log(chalk.green('Senate'));
    const senators = parseXML(data);
    senators.find('member').each((i, member) => {
        const $member = $(member);

        csv += [
            'Sen',
            $member.find('first_name').text().split(',')[0],
            $member.find('last_name').text(),
            $member.find('party').text(),
            $member.find('state').text(),
            $member.find('class').text(),
            1,
            $member.find('phone').text().replace(/[()]/g, '').replace(/ /g, '-'),
            $member.find('bioguide_id').text(),
        ].join(',') + '\n';
    });
})

// Saving
.then(() => {
    console.log(chalk.yellow('Saving'));
    fs.writeFileSync(path.join(
        __dirname,
        'csv',
        'legislators.csv'
    ), csv);
})
.catch(console.error);


function parseXML(data) {
    return $(data, {
        normalizeWhitespace: true,
        xmlMode: true,
        decodeEntities: true,
    });
}
