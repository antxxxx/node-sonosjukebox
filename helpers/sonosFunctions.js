var db = require('./jukeboxDB'),
    jukeboxDB = db.jukeboxDB;
var Sonos = require('sonos').Sonos;
var SonosServices = require('sonos').Services;
var async = require("async");
var util = require('util');
var xml2js = require('xml2js');
var _ = require('lodash');
module.exports = {
    getSonosIP: getSonosIP,
	getTrackDetails: getTrackDetails,
	getMediaInfo: getMediaInfo,
	startPlayingTrackNow: startPlayingTrackNow,
	startPlayingStream: startPlayingStream,
	getFavourites: getFavourites
};

function getSonosIP(callback) {
	var query = { 
		type: 'settings',  
		setting: 'sonos'
	};
	var projections = {  _id: 0, type: 0 }
	jukeboxDB.findOne(query, projections, function (err, docs) {
		if (err) return callback(err);
		var sonosIP = docs.value;
		callback(null, sonosIP);
	});
}

function getTrackDetails(selectionLetter, selectionNumber, callback) {
	var query = { 
		type: 'jukeboxEntry',  
		selectionLetter: selectionLetter,
		selectionNumber: selectionNumber
	};
	var projections = {  _id: 0, type: 0, selectionLetter: 0, selectionNumber: 0 }
	jukeboxDB.findOne(query, projections, function (err, docs) {
		if (err) return callback(err);
		var uri = docs.uri;
		var metadata = docs.metadata;
		var type = docs.type;                
		callback(null, uri, metadata, type);
	});

}

function getMediaInfo(sonosIP, callback) {
	var sonos = new Sonos(sonosIP, 1400);
	var action = '"urn:schemas-upnp-org:service:AVTransport:1#GetMediaInfo"';
	var body = '<u:GetMediaInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID></u:GetMediaInfo>';
	var responseTag = 'u:GetMediaInfoResponse';

	sonos.request(sonos.options.endpoints.transport, action, body, responseTag, function (err, data) {
		if (err) return callback(err);
		callback(null, data[0].currentURI[0]);
	});
	
}

function startPlayingStream(sonosIP, uri, metadata, cb) {
	var sonos = new Sonos(sonosIP, 1400);
  sonos.getZoneInfo(function (err, data) {
    if (!err) {
      var action = '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"'
      var body = '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>' + uri + '</CurrentURI><CurrentURIMetaData>' + metadata + '</CurrentURIMetaData></u:SetAVTransportURI>'
      sonos.request(sonos.options.endpoints.transport, action, body, 'u:SetAVTransportURIResponse', function (err, data) {
        if (err) return cb(err)
        if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
          return cb(null, true)
        } else {
          return cb(new Error({
            err: err,
            data: data
          }), false)
        }
      })
    } else {
      return cb(err)
    }
  })
}
function startPlayingTrackNow(sonosIP, queuedTrackNumber, callback){
	var sonos = new Sonos(sonosIP, 1400);
	async.series([
		function(callback){
			sonos.pause(function(err, data){
				callback(err);
			});
		},
		function(callback){
			sonos.selectQueue(function(err, data){
				callback(err);
			});
		},
		function(callback){
			sonos.selectTrack(queuedTrackNumber, function(err, data){
				callback(err);
			});
		},
		function(callback){
			sonos.play(function(err, data){
				callback(err);
			});
		}
	], function(err){
		callback(err);
	});
}

function getFavourites(sonosIP, callback){
	var opts = {
		BrowseFlag: 'BrowseDirectChildren',
		Filter: '*',
		StartingIndex: '0',
		RequestedCount: '100',
		SortCriteria: '',
		ObjectID: 'FV:2'
	};
	var contentDirectory = new SonosServices.ContentDirectory(sonosIP, '1400');
	return contentDirectory.Browse(opts, function (err, data) {
			if (err) return callback(err)
			return (new xml2js.Parser()).parseString(data.Result, function (err, didl) {
				if (err) return callback(err, data)
				var items = []
				if ((!didl) || (!didl['DIDL-Lite'])) {
					return callback(new Error('Cannot parse DIDTL result'), data)
				}
				var resultcontainer = didl['DIDL-Lite'].item;
				if (!util.isArray(resultcontainer)) {
					return callback(new Error('Cannot parse DIDTL result'), data)
				}
				_.each(resultcontainer, function (item) {
					var albumArtURL = null
					if (util.isArray(item['upnp:albumArtURI'])) {
					if (item['upnp:albumArtURI'][0].indexOf('http') !== -1) {
						albumArtURL = item['upnp:albumArtURI'][0]
					} else {
						albumArtURL = 'http://' + self.host + ':' + self.port + item['upnp:albumArtURI'][0]
					}
					}
					items.push({
					'title': util.isArray(item['dc:title']) ? item['dc:title'][0] : null,
					'artist': util.isArray(item['dc:creator']) ? item['dc:creator'][0] : null,
					'albumArtURL': albumArtURL,
					'album': util.isArray(item['upnp:album']) ? item['upnp:album'][0] : null,
					'uri': util.isArray(item.res) ? item.res[0]._ : null,
					'metadata': util.isArray(item['r:resMD']) ? item['r:resMD'][0] : null
					})
				})
				var result = {
					returned: data.NumberReturned,
					total: data.TotalMatches,
					items: items
				}
				return callback(null, result);
			});
	});
}