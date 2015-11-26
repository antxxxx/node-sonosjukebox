var _ = require('lodash');

var db = require('../../helpers/jukeboxDB'),
    jukeboxDB = db.jukeboxDB;
    
module.exports = {
    getAllSettings: getAllSettings,
    getSetting: getSetting,
    updateSetting: updateSetting
}

function getAllSettings(req, resp) {
    var query = { 
        type: 'settings' 
    }
    var projections = {  _id: 0, type: 0 }
    jukeboxDB.find(query, projections, function (err, docs) {
        resp.send(docs)

    });
}



function getSetting(req, resp) {
    var query = { 
        type: 'settings',  
        setting: req.swagger.params.setting.value,
    }
    var projections = {  _id: 0, type: 0 }
    jukeboxDB.findOne(query, projections, function (err, docs) {
        resp.send(docs)

    });
}


function updateSetting(req, resp) {
    var body =  req.swagger.params.body.value;
    var insertDoc = {
        type: "settings",
        setting: req.swagger.params.setting.value,
        value: req.swagger.params.body.value.value
    }
    insertDoc = _.assign(insertDoc, body)
    var query = { 
        type: 'settings',  
        setting: req.swagger.params.setting.value
    }
    jukeboxDB.update(query, insertDoc, { upsert: true }, function (err, newDoc) {   
        resp.send(insertDoc)
        // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
    });
}

