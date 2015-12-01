'use strict'

var Datastore = require('nedb')
var jukeboxDB = new Datastore({ filename: './data/jukebox.db', autoload: true });
jukeboxDB.persistence.setAutocompactionInterval(60000);
module.exports = {
    jukeboxDB: jukeboxDB
}
