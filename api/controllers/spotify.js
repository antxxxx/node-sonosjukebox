var _ = require('lodash');
var SpotifyWebApi = require('spotify-web-api-node');
var debug = require('debug')('jukebox-spotify');
var util = require('util');
var winston  = require('../../helpers/logger');


var db = require('../../helpers/jukeboxDB'),
    jukeboxDB = db.jukeboxDB;

module.exports = {
    searchSpotify: searchSpotify
};

function searchSpotify(req, resp) {
    winston.debug(util.inspect(_.pick(req, ['headers', 'method', 'url', 'query', 'params']), false, null));
    var spotifyApi = new SpotifyWebApi();
    var offset = 0;
    if ( typeof req.swagger.params.start.value !== 'undefined'  ) {
        offset = req.swagger.params.start.value;
    }

    var options = {
        limit: 10,
        market: 'GB',
        offset: offset
    };
    spotifyApi.searchTracks('track:' + req.swagger.params.q.value, options, function (err, data) {
        if (err) {
            var response = {
                "returned": "0",
                "total": "0",
                "items": []
            };
            resp.send(response);
        } else {
            var items = [];
            var itemsReturned = 0;
            if (data.body.tracks.total > 0) {
                data.body.tracks.items.forEach(function (item) {
                    var id = item.id;
                    var title = item.name;
                    var artist = item.artists[0].name;
                    var album = item.album.name;
                    var albumId = item.album.id;
                    var albumArtURL = item.album.images[0].url;
                    id = id.replace(/:/g, '%3a');
                    //id="x-sonos-spotify:spotify:track:600HVBpzF1WfBdaRwbEvLz?sid=9&flags=0";
                    var uri = 'x-sonos-spotify:spotify%3Atrack%3A' + id;
                    albumId = albumId.replace(/:/g, '%3a');
                    var didl = '<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">' +
                        '<item id="00032020spotify%3atrack%3a' + id + '" parentID="00030000spotify%3aalbum%3a' + albumId + '" restricted="true">' +
                        '<dc:title>' + title + '</dc:title>' +
                        '<upnp:class>object.item.audioItem.musicTrack</upnp:class>' +
                        '<desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">SA_RINCON2311_X_#Svc2311-0-Token</desc>' +
                        '</item>' +
                        '</DIDL-Lite>';
                    items.push({
                        'title': title,
                        'artist': artist,
                        'albumArtURL': albumArtURL,
                        'album': album,
                        'uri': uri,
                        'type': 'track',
                        'metaData': didl
                    });
                    itemsReturned++;
                });
            }
            var result = {
                returned: itemsReturned,
                total: data.body.tracks.total,
                items: items,
                start: parseInt(offset)
            };
            resp.send(result);
        }
    });
}


