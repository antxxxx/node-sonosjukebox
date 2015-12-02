var _ = require('lodash');

var db = require('../../helpers/jukeboxDB'),
    jukeboxDB = db.jukeboxDB;

module.exports = {
    getAllSettings: getAllSettings,
    getSetting: getSetting,
    updateSetting: updateSetting
};

function getAllSettings(req, resp) {
    var query = {
        recordType: 'settings'
    };
    var projections = { _id: 0, type: 0 };
    jukeboxDB.find(query, projections, function (err, docs) {
        resp.send(docs);
    });
}



function getSetting(req, resp, next) {
    var query = {
        recordType: 'settings',
        setting: req.swagger.params.setting.value
    };
    var projections = { _id: 0, type: 0 };
    jukeboxDB.findOne(query, projections, function (err, docs) {
        if (err) {
            return next(err);
        }
        resp.send(docs);
    });
}


function updateSetting(req, resp, next) {
    var body = req.swagger.params.body.value;
    var insertDoc = {
        recordType: "settings",
        setting: req.swagger.params.setting.value,
        value: req.swagger.params.body.value.value
    };
    insertDoc = _.assign(insertDoc, body);
    var query = {
        recordType: 'settings',
        setting: req.swagger.params.setting.value
    };
    jukeboxDB.update(query, insertDoc, { upsert: true }, function (err, newDoc) {
        if (err) {
            return next(err);
        }
        resp.send(insertDoc);
        // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
    });
}

