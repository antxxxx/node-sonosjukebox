var _ = require('lodash');
var Sonos = require('sonos').Sonos;
var sonosFunctions = require('../../helpers/sonosFunctions');

var db = require('../../helpers/jukeboxDB'),
    jukeboxDB = db.jukeboxDB;

module.exports = {
    searchSonos: searchSonos,
    getFavourites: getFavourites
};

function getFavourites(req, resp, next) {
    var query = {
        recordType: 'settings',
        setting: 'sonos'
    };
    var projections = { _id: 0, type: 0 };
    jukeboxDB.findOne(query, projections, function (err, docs) {
        var sonosIP = docs.value;
        sonosFunctions.getFavourites(sonosIP, function (err, data) {
            if (err) {
                var response = {
                    "returned": 0,
                    "total": 0,
                    "items": []
                };
                resp.send(response);
            } else {
                var newResponse = {
                    returned: data.returned,
                    total: data.total,
                    items: tidyArray(data.items)
                };
                resp.send(newResponse);
            }
        });
    });
}

function tidyArray(items){
    var newItems = [];
    var myDefault = {
        "title": "",
        "artist": "",
        'albumArtURL': "",
        'album': "",
        'uri': "",
        'metaData': ""
    };
    _.forEach(items, function(item){
        var newItem = _.defaults(_(item).omit(_.isNull).value(), myDefault);
        newItems.push(newItem);
    });
    return newItems;
}
function searchSonos(req, resp, next) {
    var query = {
        recordType: 'settings',
        setting: 'sonos'
    };
    var projections = { _id: 0, type: 0 };
    jukeboxDB.findOne(query, projections, function (err, docs) {
        if (err) {
            return next(err);
        }
        var sonosIP = docs.value;
        var sonos = new Sonos(sonosIP, 1400);
        var offset = 0;
        if ( typeof req.swagger.params.start.value !== 'undefined'  ) {
            offset = req.swagger.params.start.value;
        }
        var opts = {
            start: offset,
            total: 10
        };
        sonos.searchMusicLibrary('tracks', req.swagger.params.q.value, opts, function (err, data) {
            if (err) {
                var response = {
                    "returned": 0,
                    "total": 0,
                    "items": []
                };
                resp.send(response);

            } else {
                var items = _.map(data.items, function(value, index, collection){
                            return (_.assign(value, {'type': 'track'}));
                        });
                var reply = {
                    "returned": parseInt(data.returned),
                    "start": offset,
                    "total": parseInt(data.total),
                    "items": tidyArray(items)
                };
                resp.send(reply);
            }
        });
    });
}


