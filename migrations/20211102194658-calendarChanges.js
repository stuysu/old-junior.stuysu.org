'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => [
    queryInterface.removeColumn('Calendars', 'firstPeriod'),
    queryInterface.renameColumn('Calendars', 'remoteGroup', 'dayType'),
  ],

  down: async (queryInterface, Sequelize) => [
    queryInterface.addColumn('Calendars', 'firstPeriod'),
    queryInterface.renameColumn('Calendars', 'dayType', 'remoteGroup'),
  ]
};
