var _ = require('lodash');

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
    jukeboxDB.update(query, insertDoc, { upsert: true }, function (err, newDoc) {   
        resp.send(insertDoc)
        // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
    });
}

function playTrack(req, resp) {
    throw({message: 'not implemented yet'})
}