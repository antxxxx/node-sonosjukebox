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
    jukeboxDB.find({ type: 'jukeboxEntry' }, function (err, docs) {
        resp.send(docs)

    });
}

function getTracksForLetter(req, resp) {
    jukeboxDB.find({ type: 'jukeboxEntry',  selectionLetter: req.swagger.params.selectionLetter.value}, function (err, docs) {
        resp.send(docs)

    });
}


function getTrack(req, resp) {
    jukeboxDB.find({ 
        type: 'jukeboxEntry',  
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value
    }, function (err, docs) {
        resp.send(docs)

    });}


function updateTrack(req, resp) {
    var body =  req.swagger.params.body.value;
    var insertDoc = {
        type: "jukeboxEntry",
        selectionLetter: req.swagger.params.selectionLetter.value,
        selectionNumber: req.swagger.params.selectionNumber.value,
        value: body
    }
    jukeboxDB.insert(insertDoc, function (err, newDoc) {   
        resp.send(insertDoc)
        // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
    });
}

function playTrack(req, resp) {
    throw({message: 'not implemented yet'})
}