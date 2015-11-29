var db = require('./jukeboxDB'),
    jukeboxDB = db.jukeboxDB;
var Sonos = require('sonos').Sonos;

module.exports = {
    getSonosIP: getSonosIP,
	getTrackDetails: getTrackDetails,
	getMediaInfo: getMediaInfo
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
		callback(null, uri, metadata);
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