function GetConfig(setting, placeholderid) {
  $.get('/api/jukebox/settings/' + setting, function (data) {
    $('#' + placeholderid).val(data.value);
  });
}

function createResultsTable(data, tableType) {
  var table = "<thead><tr>" +
  "<th>track</th>" +
  "<th>artist</th>" +
  "<th>album</th>" + 
  "<th><div style='width: 75px' >assign to</div></th>" +
  "<th><div style='width: 75px' >assign to</div></th>" +
  "</tr></thead>";
  var i = 0;
  data.items.forEach(function (item) {
    var row = "<tr>";
    row += "<td id=" + tableType + "_title_" + i + ">" + item.title + "</td>";
    row += "<td id=" + tableType + "_artist_" + i + ">" + item.artist + "</td>";
    row += "<td id=" + tableType + "_album_" + i + ">" + item.album + "</td>";
    row += "<td style='display:none;' id=" + tableType + "_uri_" + i + ">" + item.uri + "</td>";
    row += "<td style='display:none;' id=" + tableType + "_metadata_" + i + ">" + item.metadata + "</td>";
    row += "<td style='display:none;' id=" + tableType + "_type_" + i + ">" + item.type + "</td>";
    row += "<td><input id=" + tableType + "_selection_" + i + " size='4'></td>";
    var onClickString = 'AssignTrack(' + i + ', "' + tableType + '")';
    row += "<td><button type='button' onclick='" + onClickString + "'>assign</button></td>";
    row += "</tr>";
    table += row;
    i++;
  });
  return (table);  
}

function GetFavourites() {
  $.get('/api/sonos/favourites', function (data) {
    var table = createResultsTable(data, 'favourite');
    $("#favouriteResults").html(table);
  });
}
function SetConfig(setting, placeholderid) {
  var value = $('#' + placeholderid).val();
  var postData = {
    "value": value
  };
  $.ajax({
    url: '/api/jukebox/settings/' + setting,
    type: "POST",
    data: JSON.stringify(postData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function () {
    }
  });
}

function UpdateSelection(numberSelection) {
  var letterSelection = $(".active")[0].text;
  var postData = {
    "selection": letterSelection + numberSelection,
    "title": $('#title_' + numberSelection).val(),
    "artist": $('#artist_' + numberSelection).val()
  };
  $.ajax({
    url: '/api/jukebox/tracks/' + letterSelection + '/' + numberSelection + '/',
    type: "POST",
    data: JSON.stringify(postData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function () {
    }
  });
}

function SearchSonos(start) {
  var url = "api/sonos/search?q=" + $('#searchString').val() + '&start=' + start;
  $.get(url, function (data) {
    $('#sonosReturned').text("Items returned : " + data.returned);
    $('#sonosTotal').text("Total results : " + data.total);
    var table = createResultsTable(data, 'sonos');
    $("#sonosResults").html(table);
    if ((data.total - data.returned - start) > 0) {
      $('#sonosNext').show();
      $('#sonosNext').off('click');
      $('#sonosNext').click(function(){
        SearchSonos(start+10);
      });
    } else {
      $('#sonosNext').hide();
    }
    if (start > 0) {
      $('#sonosPrevious').show();
      $('#sonosPrevious').off('click');
      $('#sonosPrevious').click(function(){
        SearchSonos(start-10);
      });
    } else {
      $('#sonosPrevious').hide();
    }
  });
}

function SearchSpotify(start) {
  var spotifyURL = "api/spotify/search?q=" + $('#searchString').val() + '&start=' + start;
  $.get(spotifyURL, function (data) {
    $('#spotifyReturned').text("Items returned : " + data.returned);
    $('#spotifyTotal').text("Total results : " + data.total);
    var table = createResultsTable(data, 'spotify');
    $("#spotifyResults").html(table);
    if ((data.total - data.returned - start) > 0) {
      $('#spotifyNext').show();
      $('#spotifyNext').off('click');
      $('#spotifyNext').click(function(){
        SearchSpotify(start+10);
      });
    } else {
      $('#spotifyNext').hide();
    }
    if (start > 0) {
      $('#spotifyPrevious').show();
      $('#spotifyPrevious').off('click');
      $('#spotifyPrevious').click(function(){
        SearchSpotify(start-10);
      });
    } else {
      $('#spotifyPrevious').hide();      
    }
  });
}
function Search() {
  SearchSonos(0);
  SearchSpotify(0);
}

function AssignTrack(rowSelected, searchType) {
  var artist = $('#' + searchType + '_artist_' + rowSelected).text();
  var title = $('#' + searchType + '_title_' + rowSelected).text();
  var uri = $('#' + searchType + '_uri_' + rowSelected).text();
  var metadata = $('#' + searchType + '_metadata_' + rowSelected).text();
  var selection = $('#' + searchType + '_selection_' + rowSelected).val().toUpperCase();
  var type = $('#' + type + '_type_' + rowSelected).val();
  var letterSelection = selection.charAt(0);
  var numberSelection = selection.charAt(1);
  var postData = {
    "selection": selection,
    "title": title,
    "artist": artist,
    "uri": uri,
    "metadata": metadata,
    "type": type
  };
  var url = 'api/jukebox/tracks/' + letterSelection + '/' + numberSelection + '/';
  $.ajax({
    url: url,
    type: "POST",
    data: JSON.stringify(postData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function () {
    }
  });
}
