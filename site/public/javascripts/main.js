/* 
 * this is javascript that is run in the browser
 */


function GetConfig(setting, placeholderid) {
    $.get('/api/jukebox/settings/' + setting, function (data) {
        $('#' + placeholderid).text(data.value);
    });
}


GetConfig("sonos", "sonosip");