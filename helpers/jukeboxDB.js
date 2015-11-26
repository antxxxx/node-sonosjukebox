'use strict'

var Datastore = require('nedb')
var jukeboxDB = new Datastore({ filename: './data/jukebox.db', autoload: true });
  
module.exports = {
    jukeboxDB: jukeboxDB
}
