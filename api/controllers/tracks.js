var _ = require('lodash');
var Sonos = require('sonos').Sonos;
var async = require("async");
var sonosFunctions = require('../../helpers/sonosFunctions');
var debug = require('debug')('jukebox-tracks');
var util = require('util');

var db = require('../../helpers/jukeboxDB'),
    jukeboxDB = db.jukeboxDB;

module.exports = {
    getAllTracks: getAllTracks,
    getTrack: getTrack,
    updateTrack: updateTrack,
    insertTrack: insertTrack,
    playTrack: playTrack,
    getTracksForLetter: getTracksForLetter
};

function getAllTracks(req, resp, next) {
    debug(util.inspect(_.pick(req, ['headers', 'method', 'url', 'query', 'params']), false, null));
    var query = {
        recordType: 'jukeboxEntry'
    };
    var projections = { _id: 0, recordType: 0, selectionLetter: 0, selectionNumber: 0 };
    jukeboxDB.find(query, projections, function (err, docs) {
        if (err) {
            return next(err);
        }
        resp.send(docs);
    });
}

function getTracksForLetter(req, resp, next) {
    debug(util.inspect(_.pick(req, ['headers', 'method', 'url', 'query', 'params']), false, null));
    var query = {
        recordType: 'jukeboxEntry',
        selectionLetter: req.swagger.params.selectionLetter.value
    };
    var projections = { _id: 0, recordType: 0 };
    jukeboxDB.find(query, projections, function (err, docs) {
        if (err) {
            return next(err);
        }
        resp.send(docs);
    });
}


function getTrack(req, resp, next) {
    debug(util.inspect(_.pick(req, ['headers', 'method', 'url', 'query', 'params']), false, null));
    var query = {
        recordType: 'jukeboxEntry',
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    };
    var projections = { _id: 0, recordType: 0, selectionLetter: 0, selectionNumber: 0 };
    jukeboxDB.findOne(query, projections, function (err, docs) {
        if (err) {
            return next(err);
        }
        if (docs === null) {
            docs = {
                title: "",
                uri: "",
                type: ""
            };
        }
        resp.send(docs);
    });
}


function updateTrack(req, resp, next) {
    debug(util.inspect(_.pick(req, ['headers', 'method', 'url', 'query', 'params']), false, null));
    debug(util.inspect( req.swagger.params.body.value, false, null));
    var body = req.swagger.params.body.value;
    var insertDoc = {
        recordType: "jukeboxEntry",
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    };
    insertDoc = _.assign(insertDoc, body);
    var query = {
        recordType: 'jukeboxEntry',
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    };
    jukeboxDB.update(query, { $set: insertDoc }, function (err, numReplaced) {
        if (err) {
            return next(err);
        }
        resp.send(insertDoc);
        // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
    });
}

function insertTrack(req, resp, next) {
    debug(util.inspect(_.pick(req, ['headers', 'method', 'url', 'query', 'params']), false, null));
    debug(util.inspect( req.swagger.params.body.value, false, null));
    var body = req.swagger.params.body.value;
    body.metaData = decodeURI(body.metaData);
    var insertDoc = {
        recordType: "jukeboxEntry",
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    };
    insertDoc = _.assign(insertDoc, body);
    var query = {
        recordType: 'jukeboxEntry',
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    };
    jukeboxDB.update(query, insertDoc , { upsert: true }, function (err, numReplaced, upsert) {
        if (err) {
            return next(err);
        }
        resp.status(201).send(insertDoc);
        // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
    });
}

function playTrack(req, resp, next) {
    debug(util.inspect(_.pick(req, ['headers', 'method', 'url', 'query', 'params']), false, null));
    var sonosIP;
    var uri;
    var metaData;
    var type;
    async.parallel([
        // get sonos ip
        function (callback) {
            sonosFunctions.getSonosIP(function (err, data) {
                if (err) return callback(err);
                sonosIP = data;
                callback();
            });
        },
        // get track details
        function (callback) {
            sonosFunctions.getTrackDetails(req.swagger.params.selectionLetter.value,
                req.swagger.params.selectionNumber.value,
                function (err, returnedURI, returnedMetadata, returnedType) {
                    if (err) return callback(err);
                    uri = returnedURI;
                    metaData = returnedMetadata;
                    type = returnedType;
                    callback();
                });
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
        if (type === 'track') {
            sonosFunctions.queueTrackAndGetCurrentState(sonosIP, uri, metaData, function(err, data){
                if (err) {
                    return next(err);
                }
                var response = {
                    enquedTrackNumber: parseInt(data.queuedTrackNumber)
                };
                if (data.playingState !== 'playing' || data.playing.substring(0, 14) !== 'x-rincon-queue' ) {
                    sonosFunctions.startPlayingTrackNow(sonosIP, data.queuedTrackNumber, function (err, data) {
                        if (err) {
                            return next(err);
                        }
                        resp.status(202).send(response);
                    });
                } else {
                    resp.status(202).send(response);
                }
            });
        } else {
            // this is the bit where it is not a track
            sonosFunctions.startPlayingStream(sonosIP, uri, metaData, function (err, data) {
                if (err) {
                    return next(err);
                }
                var response = {
                    enquedTrackNumber: 0
                };                
                resp.status(202).send(response);
            });
        }
    });
}

