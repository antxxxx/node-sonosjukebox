var _ = require('lodash');
var Sonos = require('sonos').Sonos;
var async = require("async");


var db = require('../../helpers/jukeboxDB'),
    jukeboxDB = db.jukeboxDB;

module.exports = {
    getAllTracks: getAllTracks,
    getTrack: getTrack,
    updateTrack: updateTrack,
    playTrack: playTrack,
    getTracksForLetter: getTracksForLetter
}

function getAllTracks(req, resp) {
    var query = { 
        type: 'jukeboxEntry' 
    }
    var projections = {  _id: 0, type: 0, selectionLetter: 0, selectionNumber: 0 }
    jukeboxDB.find(query, projections, function (err, docs) {
        resp.send(docs)

    });
}

function getTracksForLetter(req, resp) {
    var query = { 
        type: 'jukeboxEntry',  
        selectionLetter: req.swagger.params.selectionLetter.value
    }
    var projections = {  _id: 0, type: 0 }
    jukeboxDB.find(query, projections, function (err, docs) {
        resp.send(docs)
    });
}


function getTrack(req, resp) {
    var query = { 
        type: 'jukeboxEntry',  
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    }
    var projections = {  _id: 0, type: 0, selectionLetter: 0, selectionNumber: 0 }
    jukeboxDB.findOne(query, projections, function (err, docs) {
        resp.send(docs)

    });
}


function updateTrack(req, resp) {
    var body =  req.swagger.params.body.value;
    var insertDoc = {
        type: "jukeboxEntry",
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    }
    insertDoc = _.assign(insertDoc, body)
    var query = { 
        type: 'jukeboxEntry',  
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    }
    jukeboxDB.update(query, { $set:insertDoc }, { upsert: true }, function (err, newDoc) {   
        resp.send(insertDoc)
        // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
    });
}

function playTrack(req, resp) {
    var sonosIP;
    var uri;
    var metadata;
    var playing;
    async.series([
        // get sonos ip
        function(callback) {
            var query = { 
                type: 'settings',  
                setting: 'sonos'
            };
            var projections = {  _id: 0, type: 0 }
            jukeboxDB.findOne(query, projections, function (err, docs) {
                if (err) return callback(err);
                sonosIP = docs.value;
                callback();
            });
        },
        // get track details
        function(callback){
            var query = { 
                type: 'jukeboxEntry',  
                selectionLetter: req.swagger.params.selectionLetter.value,
                selectionNumber: req.swagger.params.selectionNumber.value
            };
            var projections = {  _id: 0, type: 0, selectionLetter: 0, selectionNumber: 0 }
            jukeboxDB.findOne(query, projections, function (err, docs) {
                if (err) return callback(err);
                uri = docs.uri;
                metadata = docs.metadata;                
                callback();
            });
        },
        // play the track
        function(callback){
            var sonos = new Sonos(sonosIP, 1400);
            var options = {
                uri: uri,
                metadata: metadata
            };
            sonos.play(options, function(err, res){
                if (err) return callback(err);
                playing = res;
                callback();
            });
        }
        
    ], function(err){
        if (err) {
            resp.send(err);
            return;
        }
        resp.send(playing);
    });

}