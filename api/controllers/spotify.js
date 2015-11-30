var _ = require('lodash');
var SpotifyWebApi = require('spotify-web-api-node');

var db = require('../../helpers/jukeboxDB'),
    jukeboxDB = db.jukeboxDB;

module.exports = {
    searchSpotify: searchSpotify
};

function searchSpotify(req, resp) {
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
                    var uri = 'x-sonos-spotify:' + id + '?sid=9&flags=0';
                    id = id.replace(/:/g, '%3a');
                    albumId = albumId.replace(/:/g, '%3a');
                    var didl = '<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">' +
                        '<item id="00030020' + id + '" parentID="00020000track:' + title + '" restricted="true">' +
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
                        'metaData': didl
                    });
                    itemsReturned++;
                });
            }
            var result = {
                returned: itemsReturned,
                total: data.body.tracks.total,
                items: items
            };
            resp.send(result);
        }
    });
}


