/**
 * This file contains every page on the admin panel 
 * (the actual frontend for it)
 */

const express = require('express');
const route = express.Router();

const {requireAuthAdmin} = require('../auth.js');

const { Analytics, Events, Link, Sheets, Attributes, sequelize } = require('../../models');

const TabTypes = {

  'dashboard': {
    page: './tabs/analytics',
    scripts: [{src: '/javascripts/admin/analytics.js'}],

    getData: async () => {
        return { analytics: await Analytics.findAll({ order: [ ['views', 'DESC'] ] }) };
    }
  },

  'calendar': {
    page: './tabs/calendar',
    scripts: [{src: '/javascripts/admin/calendar.js'}],

    getData: () => null
  },

  'events': {
    page: './tabs/events',
    scripts: [{src: '/javascripts/admin/events.js'}],

    getData: async () => {
        return { events: await Events.findAll() };
    }
  },

  'study-guides': {
    page: './tabs/guides',
    scripts: [{src: '/javascripts/admin/sheets.js'}],

    getData: async () => {
        let sheets = await Sheets.findAll();
        for (let sheet of sheets) 
            sheet['keywords'] = await Attributes.findAll({ where: { SheetId: sheet.id }});
        
        return { sheets: sheets };
    }
  },

  'links': {
    page: './tabs/links',
    scripts: [{src: '/javascripts/admin/links.js'}],

    getData: async () => {
        return { links: await Link.findAll({ order: sequelize.col('ordering') }) };
    }
  },

};


// Go from url readable to human readable
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

// get the redirects from the tab types
function* getRedirects(activeTab) {
    for (let tab in TabTypes) {
        yield {
            url: `/admin/${tab}`,
            name: fixed(tab),
            active: tab === activeTab
        };
    }
}

// Loads the admin panel (with proper authorization)
// admin page is a speical page for now
route.get(
    '/',

    requireAuthAdmin(),

    async (_req, res, _next) => {
        const { payload } = res.locals;

        res.render('admin/', {
            data: { 
                name: payload.name,
                picture: payload.picture
            },
            redirects: getRedirects(''),
            scripts: [],
            page: './welcome'
        });
    }
);

route.get(
    '/:tab', 

    requireAuthAdmin(), 
    
    async (req, res, _next) => {
        const tab = req.params.tab;
        const typeData = TabTypes[tab];

        res.render(
            'admin/',
            {
                // navbar data
                redirects: getRedirects(tab),

                // chooses which ejs to render
                page: typeData.page,

                // loads data specific to response type
                data: await typeData.getData(),

                // loads scripts specific to response type
                scripts: typeData.scripts
            }
        );
    }
);

module.exports = route;