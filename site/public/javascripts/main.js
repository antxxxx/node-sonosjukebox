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

function Search() {
    var url = "api/sonos/search?q=" + $('#searchString').val();
    $.get(url, function (data) {
        $('#sonosReturned').text(data.returned);
        $('#sonosTotal').text(data.total);
        var table = "";
        var i=0;
        data.items.forEach(function(item) {
          var row = "<tr>";
          row += "<td id=sonos_title_" + i +">" + item.title +"</td>";
          row += "<td id=sonos_artist_" + i +">" + item.artist +"</td>";
          row += "<td id=sonos_album_" + i +">" + item.album +"</td>";
          row += "<td style='display:none;' id=sonos_uri_" + i +">" + item.uri +"</td>";
          row += "<td style='display:none;' id=sonos_metadata_" + i +"></td>";
          row += "<td><input id=sonos_selection_" + i + "></td>";
          row += "<td><button type='button' onclick='AssignTrack(" + i + ", 'sonos')'>assign</button></td>";
          row += "</tr>";
          table += row;
          i++;
        });
        $("#sonosResults").html(table);
    });

    var url = "api/spotify/search?q=" + $('#searchString').val();
    $.get(url, function (data) {
        $('#spotifyReturned').text(data.returned);
        $('#spotifyTotal').text(data.total);
        var table = "";
        var i=0;
        data.items.forEach(function(item) {
          var row = "<tr>";
          row += "<td id=spotify_title_" + i +">" + item.title +"</td>";
          row += "<td id=spotify_artist_" + i +">" + item.artist +"</td>";
          row += "<td id=spotify_album_" + i +">" + item.album +"</td>";
          row += "<td style='display:none;' id=spotify_uri_" + i +">" + item.uri +"</td>";
          row += "<td style='display:none;' id=spotify_metadata_" + i +"></td>";
          row += "<td><input id=spotify_selection_" + i + "></td>";
          row += "<td><button type='button' onclick='AssignTrack(" + i + ", 'spotify')'>assign</button></td>";
          row += "</tr>";
          table += row;
          i++;
        });
        $("#spotifyResults").html(table);
    });
    
}

function AssignTrack(rowSelected, searchType){
  var artist = $('#' + searchType + '_artist_' + rowSelected).text();
  var title = $('#' + searchType + '_title_' + rowSelected).text();
  var uri = $('#' + searchType + '_uri_' + rowSelected).text();
  var metadata = $('#' + searchType + '_metadata_' + rowSelected).text();
  var selection = $('#' + searchType + '_selection_' + rowSelected).val().toUpperCase();
  var letterSelection = selection.charAt(0);
  var numberSelection = selection.charAt(1);
  var postData = {
    "selection": selection,
    "title": title,
    "artist": artist,
    "uri": uri,
    "metadata": metadata
  };
  var url = 'api/jukebox/tracks/' + letterSelection + '/' + numberSelection +'/';
  $.ajax({
    url:url,
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