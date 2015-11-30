var _ = require('lodash');
var Sonos = require('sonos').Sonos;
var async = require("async");
var sonosFunctions = require('../../helpers/sonosFunctions');

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
    var queuedTrackNumber;
    var playingState;
    var type;
    async.series([
        // get sonos ip
        function(callback) {
            sonosFunctions.getSonosIP(function(err, data){
                if (err) return callback(err);
                sonosIP = data;
                callback();
            });
        },
        // get track details
        function(callback){
            sonosFunctions.getTrackDetails(req.swagger.params.selectionLetter.value,
            req.swagger.params.selectionNumber.value,
            function(err, returnedURI, returnedMetadata, returnedType){
                if (err) return callback(err);
                uri = returnedURI;
                metadata = returnedMetadata;
                type = returnedType;
                callback();
            });
        },
        // queue the track
        function(callback){
            var sonos = new Sonos(sonosIP, 1400);
            var options = {
                uri: uri,
                metadata: metadata
            };
            sonos.queue(options, function(err, res){
                if (err) return callback(err);
                queuedTrackNumber = res[0].FirstTrackNumberEnqueued[0];
                callback();
            });
        },
        // get current playing track
        function(callback){
            sonosFunctions.getMediaInfo(sonosIP, function(err, data){
                if (err) return callback(err);
                playing = data;
                callback();                
            });
        },
        // get current state
        function(callback){
            var sonos = new Sonos(sonosIP, 1400);
            sonos.getCurrentState(function(err, data){
                if (err) return callback(err);
                playingState = data;
                callback();                
            });
        },
        // work out whether to play or queue track
        function(callback){
            var startPlaying = false;
            if (
              (playing.substring(0, 14) !== 'x-rincon-queue') || 
              (playingState !== 'playing')) {
                startPlaying = true;
            }
            if (startPlaying) {
                sonosFunctions.startPlayingTrackNow(sonosIP, queuedTrackNumber, function(err, data){
       				if (err) return callback(err);
                    callback();
                });
            } else if (type === 'stream') {
                sonosFunctions.startPlayingStream(sonosIP, uri, metadata, function(err, data){
       				if (err) return callback(err);
                    callback();
                })
            }
        }
        ], function(err){
        if (err) {
            resp.send(err);
            return;
        }
        resp.send(playing);
    });

}