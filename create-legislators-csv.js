const $ = require('cheerio');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

function parseXML(filename) {
    const buffer = fs.readFileSync(
        path.join(
            __dirname,
            'xml',
            filename
        ),
        'utf-8'
    );
    const xml = $(buffer, {
        normalizeWhitespace: true,
        xmlMode: true,
    });
    return xml;
}


let csv = 'title,firstname,middlename,lastname,name_suffix,nickname,party,state,district,in_office,gender,phone,fax,website,webform,congress_office,bioguide_id,votesmart_id,fec_id,govtrack_id,crp_id,twitter_id,congresspedia_url,youtube_url,facebook_id,official_rss,senate_class,birthdate,oc_email\n';

console.log(chalk.green('Parsing Reps'));
const house = parseXML('house.xml');
house.find('members member').each((i, member) => {
    const $member = $(member);

    if ($member.find('predecessor-info').length > 0) {
        return;
    }

    csv += [
        'Rep',
        $member.find('firstname').text(),
        '',
        $member.find('lastname').text(),
        '',
        '',
        $member.find('party').text(),
        $member.find('statedistrict').text().slice(0, 2),
        +$member.find('statedistrict').text().slice(2),
        1,
        '',
        $member.find('phone').text().replace(/[()]/g, '').replace(/ /g, '-'),
        '',
        '',
        '',
        '',
        $member.find('bioguideID').text(),
    ].join(',') + '\n';
});

console.log(chalk.green('Parsing Senators'));
const senators = parseXML('senators.xml');
senators.find('member').each((i, member) => {
    const $member = $(member);

    if ($member.find('predecessor-info').length > 0) {
        return;
    }

    csv += [
        'Sen',
        $member.find('first_name').text().split(',')[0],
        '',
        $member.find('last_name').text(),
        '',
        '',
        $member.find('party').text(),
        $member.find('state').text(),
        $member.find('class').text(),
        1,
        '',
        $member.find('phone').text().replace(/[()]/g, '').replace(/ /g, '-'),
        '',
        '',
        '',
        '',
        $member.find('bioguide_id').text(),
    ].join(',') + '\n';
});

console.log(chalk.yellow('Saving file'));
fs.writeFileSync(path.join(
    __dirname,
    'csv',
    'legislators.csv'
), csv);
