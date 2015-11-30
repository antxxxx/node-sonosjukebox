function GetConfig(setting, placeholderid) {
  $.get('/api/jukebox/settings/' + setting, function (data) {
    $('#' + placeholderid).val(data.value);
  });
}

function GetFavourites() {
  $.get('/api/sonos/favourites', function (data) {
    var table = "<thead><tr><th>track</th><th>artist</th><th>album</th><th>assign to</th><th></th></tr></thead>";
    var i = 0;
    data.items.forEach(function (item) {
      var row = "<tr>";
      row += "<td id=favourite_title_" + i + ">" + item.title + "</td>";
      row += "<td id=favourite_artist_" + i + ">" + item.artist + "</td>";
      row += "<td id=favourite_album_" + i + ">" + item.album + "</td>";
      row += "<td style='display:none;' id=favourite_uri_" + i + ">" + item.uri + "</td>";
      row += "<td style='display:none;' id=favourite_metadata_" + i + ">" + item.metadata + "</td>";
      row += "<td style='display:none;' id=favourite_type_" + i + ">" + item.type + "</td>";
      row += "<td><input id=favourite_selection_" + i + "></td>";
      var onClickString = 'AssignTrack(' + i + ', "favourite")';
      row += "<td><button type='button' onclick='" + onClickString + "'>assign</button></td>";
      row += "</tr>";
      table += row;
      i++;
    });
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

function Search() {
  var url = "api/sonos/search?q=" + $('#searchString').val();
  $.get(url, function (data) {
    $('#sonosReturned').text("Items returned : " + data.returned);
    $('#sonosTotal').text("Total results : " + data.total);
    var table = "<thead><tr><th>track</th><th>artist</th><th>album</th><th>assign to</th><th></th></tr></thead>";
    var i = 0;
    data.items.forEach(function (item) {
      var row = "<tr>";
      row += "<td id=sonos_title_" + i + ">" + item.title + "</td>";
      row += "<td id=sonos_artist_" + i + ">" + item.artist + "</td>";
      row += "<td id=sonos_album_" + i + ">" + item.album + "</td>";
      row += "<td style='display:none;' id=sonos_uri_" + i + ">" + item.uri + "</td>";
      row += "<td style='display:none;' id=sonos_metadata_" + i + "></td>";
      row += "<td style='display:none;' id=sonos_type_" + i + ">track</td>";
      row += "<td><input id=sonos_selection_" + i + "></td>";
      var onClickString = 'AssignTrack(' + i + ', "sonos")';
      row += "<td><button type='button' onclick='" + onClickString + "'>assign</button></td>";
      row += "</tr>";
      table += row;
      i++;
    });
    $("#sonosResults").html(table);
  });

  var spotifyURL = "api/spotify/search?q=" + $('#searchString').val();
  $.get(spotifyURL, function (data) {
    $('#spotifyReturned').text("Items returned : " + data.returned);
    $('#spotifyTotal').text("Total results : " + data.total);
    var table = "<thead><tr><th>track</th><th>artist</th><th>album</th><th>assign to</th><th></th></tr></thead>";
    var i = 0;
    data.items.forEach(function (item) {
      var row = "<tr>";
      row += "<td id=spotify_title_" + i + ">" + item.title + "</td>";
      row += "<td id=spotify_artist_" + i + ">" + item.artist + "</td>";
      row += "<td id=spotify_album_" + i + ">" + item.album + "</td>";
      row += "<td style='display:none;' id=spotify_uri_" + i + ">" + item.uri + "</td>";
      row += "<td style='display:none;' id=spotify_metadata_" + i + "></td>";
      row += "<td style='display:none;' id=spotify_type_" + i + ">track</td>";
      row += "<td><input id=spotify_selection_" + i + "></td>";
      var onClickString = 'AssignTrack(' + i + ', "spotify")';
      row += "<td><button type='button' onclick='" + onClickString + "'>assign</button></td>";
      row += "</tr>";
      table += row;
      i++;
    });
    $("#spotifyResults").html(table);
  });

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
