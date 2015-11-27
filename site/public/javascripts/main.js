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

$('ul.nav.nav-tabs').each(function(){
    // For each set of tabs, we want to keep track of
    // which tab is active and it's associated content

    $("#LetterSelection").hide();
    // Bind the click event handler
    $(this).on('click', 'a', function(e){
      var url = '/api/jukebox/tracks/' + $(this)[0].text +'/';
      $.get(url, function (data) {
        $("#LetterSelection").show();
        $("#DefaultSelection").hide();
        $.each(data, function(index, value) {
          var selectionNumber = value.selectionNumber;
          $('#artist_' + selectionNumber).text(value.artist);
          $('#title_' + selectionNumber).text(value.title);
        });
      });

      // Prevent the anchor's default click action
      e.preventDefault();
    });
  });

GetConfig("sonos", "sonosip");