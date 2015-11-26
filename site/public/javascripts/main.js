/* 
 * this is javascript that is run in the browser
 */


function GetConfig(setting, placeholderid) {
    $.get('/api/jukebox/settings/' + setting, function (data) {
        $('#' + placeholderid).val(data.value);
    });
}

function SetConfig(setting, placeholderid) {
    var value = $('#' + placeholderid).val();
    var postData = {
        "value": value
    };
    $.ajax({
        url:'/api/jukebox/settings/' + setting,
        type:"POST",
        data:JSON.stringify(postData),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(){
        }
    });
}
GetConfig("sonos", "sonosip");