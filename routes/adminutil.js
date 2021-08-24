/**
 * utilities for admin panel frontend code
*/
const { Analytics, Events, Link, Sheets, Attributes, sequelize } = require('../models');

const ResponseTypes = {
    'links': {
        page: './responses/links',
        scripts: [{src: '/javascripts/admin/links.js'}],

        getData: async () => {
            return { links: await Link.findAll({ order: sequelize.col('ordering') }) };
        }
    },

    'study-guides': {
        page: './responses/guides',
        scripts: [{src: '/javascripts/admin/sheets.js'}],

        getData: async () => {
            let sheets = await Sheets.findAll();
            for (let sheet of sheets) 
                sheet['keywords'] = await Attributes.findAll({ where: { SheetId: sheet.id }});
            
            return { sheets: sheets };
        }
    },

    'analytics': {
        page: './responses/analytics',
        scripts: [{src: '/javascripts/admin/analytics.js'}],

        getData: async () => {
            return { analytics: await Analytics.findAll({ order: [ ['views', 'DESC'] ] }) };
        }
    },

    'events': {
        page: './responses/events',
        scripts: [{src: '/javascripts/admin/events.js'}],

        getData: async () => {
            return { events: await Events.findAll() };
        }
    },

    'calendar': {
        page: './responses/calendar',
        scripts: [{src: '/javascripts/admin/calendar.js'}],

        getData: () => null
    }
};

module.exports.ResponseTypes = ResponseTypes;

function fixed(text) {
    let before = ' ';
    let out = '';
    for (let char of text) {
        char = char === '-' ? ' ' : char;

        if (before === ' ') {
            out += char.toUpperCase();
        } else {
            out += char;
        }

        before = char;
    }

    return out;
}

function getRedirects(activeType) {
    let redirects = [];
    for (let type in ResponseTypes) {
        redirects.push({
            url: `/admin/tab/${type}`,
            name: fixed(type),
            active: activeType === type
        })
    }

    return redirects;
}

module.exports.getRedirects = getRedirects;