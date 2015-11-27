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

function UpdateSelection(numberSelection) {
    var letterSelection = $(".active")[0].text;
    var postData =   {
      "selection": letterSelection + numberSelection,
      "title": $('#title_' + numberSelection).val(),
      "artist": $('#artist_' + numberSelection).val()
    };
    $.ajax({
        url:'/api/jukebox/tracks/' + letterSelection + '/' + numberSelection + '/',
        type:"POST",
        data:JSON.stringify(postData),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(){
        }
    });
}

$('ul.nav.nav-tabs').each(function(){
    var $active;
    $active = $("#DefaultSelection");
    // For each set of tabs, we want to keep track of
    // which tab is active and it's associated content

    $("#LetterSelection").hide();
    // Bind the click event handler
    $(this).on('click', 'a', function(e){
      $active.removeClass('active');
      $active = $(this);
      $active.addClass('active');
      var url = '/api/jukebox/tracks/' + $(this)[0].text +'/';
      $.get(url, function (data) {
        $("#LetterSelection").show();
        $("#DefaultSelection").hide();
        for (i = 0; i < 9; i++) { 
          $('#artist_' + i).val("");
          $('#title_' + i).val("");
          $('#update_' + i).hide();
        }
        $.each(data, function(index, value) {
          var selectionNumber = value.selectionNumber;
          $('#artist_' + selectionNumber).val(value.artist);
          $('#title_' + selectionNumber).val(value.title);
          $('#update_' + selectionNumber).show();
        });
      });

      // Prevent the anchor's default click action
      e.preventDefault();
    });
  });

GetConfig("sonos", "sonosip");