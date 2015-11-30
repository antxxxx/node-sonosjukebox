var db = require('./jukeboxDB'),
    jukeboxDB = db.jukeboxDB;
var Sonos = require('sonos').Sonos;
var async = require("async");

module.exports = {
    getSonosIP: getSonosIP,
	getTrackDetails: getTrackDetails,
	getMediaInfo: getMediaInfo,
	startPlayingTrackNow: startPlayingTrackNow,
	startPlayingStream: startPlayingStream
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