var _ = require('lodash');
var Sonos = require('sonos').Sonos;
var sonosFunctions = require('../../helpers/sonosFunctions');

var db = require('../../helpers/jukeboxDB'),
    jukeboxDB = db.jukeboxDB;
    
module.exports = {
    searchSonos: searchSonos,
    getFavourites: getFavourites
}

function getFavourites(req, resp) {
    var query = { 
        type: 'settings',  
        setting: 'sonos'
    }
    var projections = {  _id: 0, type: 0 }
    jukeboxDB.findOne(query, projections, function (err, docs) {
        var sonosIP = docs.value;
        sonosFunctions.getFavourites(sonosIP, function(err, data){
            if (err) {
                var response = {
                    "returned": "0",
                    "total": "0",
                    "items": []
                }
                resp.send(response)

            } else {
                resp.send(data)
            }
        })
    });
}


function searchSonos(req, resp) {
    var query = { 
        type: 'settings',  
        setting: 'sonos'
    }
    var projections = {  _id: 0, type: 0 }
    jukeboxDB.findOne(query, projections, function (err, docs) {
        var sonosIP = docs.value;
        var sonos = new Sonos(sonosIP, 1400);
        var opts = {
            start: 0,
            total : 10
        }
        sonos.searchMusicLibrary('tracks', req.swagger.params.q.value, opts, function (err, data) {
            if (err) {
                var response = {
                    "returned": "0",
                    "total": "0",
                    "items": []
                }
                resp.send(response)

            } else {
                resp.send(data)
            }
        })
    });
}


