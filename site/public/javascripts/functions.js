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
    type: "PATCH",
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
    //$('#sonosReturned').text("Items returned : " + data.returned);
    $('#sonosTotal').text("Total results : " + data.total);
    var pageMessage = "Page " + ((start/10) +1) +" of " + (Math.floor(data.total/10) + 1);
    $('#sonosResultPage').text(pageMessage);
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
    //$('#spotifyReturned').text("Items returned : " + data.returned);
    $('#spotifyTotal').text("Total results : " + data.total);
    var pageMessage = "Page " + ((start/10) +1) +" of " + (Math.floor(data.total/10) + 1);
    $('#spotifyResultPage').text(pageMessage);
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
  var type = $('#' + searchType + '_type_' + rowSelected).text();
  var letterSelection = selection.charAt(0);
  var numberSelection = selection.replace(letterSelection, '');
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
      var selectedAssignment = $( ".active" )[0].text;
      if (letterSelection === selectedAssignment) {
        displayAssignments(letterSelection);
      }
    }
  });
}

function populateStripsForm(letterSelection, offset, cb) {
  var url = '/api/jukebox/tracks/' + letterSelection + '/';
  $.get(url, function (data) {
    $.each(data, function (index, value) {
      var i = Math.ceil(parseInt(value.selectionNumber)/2) + offset;
      var aORb = 'a';
      if ((parseInt(value.selectionNumber) % 2) === 0) {
        aORb = 'b';
      }
      $('#artist_' + aORb + '_' + i ).val(value.artist);
      $('#title_' + aORb + '_' + i ).val(value.title);
    });
    cb();
  });
}

function printPDF1() {
  for (i = 1; i < 21; i++) {
    $('#artist_a_' + i ).val("");
    $('#title_a_' + i ).val("");
    $('#artist_b_' + i ).val("");
    $('#title_b_' + i ).val("");
  }
  populateStripsForm('A', 0, function(){
    populateStripsForm('B', 5, function(){
      populateStripsForm('C', 10, function(){
        populateStripsForm('D', 15, function(){
          $( "#record-entry" ).submit();
        });
      });
    });
  });
}

function printPDF2() {
  for (i = 1; i < 21; i++) {
    $('#artist_a_' + i ).val("");
    $('#title_a_' + i ).val("");
    $('#artist_b_' + i ).val("");
    $('#title_b_' + i ).val("");
  }
  populateStripsForm('E', 0, function(){
    populateStripsForm('F', 5, function(){
      populateStripsForm('G', 10, function(){
        populateStripsForm('H', 15, function(){
          $( "#record-entry" ).submit();
        });
      });
    });
  });
}

function printPDF3() {
  for (i = 1; i < 21; i++) {
    $('#artist_a_' + i ).val("");
    $('#title_a_' + i ).val("");
    $('#artist_b_' + i ).val("");
    $('#title_b_' + i ).val("");
  }
  populateStripsForm('J', 0, function(){
    populateStripsForm('K', 5, function(){
      $( "#record-entry" ).submit();
    });
  });
}

function displayAssignments(letter) {
  var url = '/api/jukebox/tracks/' + letter + '/';
  $.get(url, function (data) {
    $("#LetterSelection").show();
    $("#DefaultSelection").hide();
    for (i = 1; i < 11; i++) {
      $('#artist_' + i).val("");
      $('#title_' + i).val("");
      $('#update_' + i).hide();
    }
    $.each(data, function (index, value) {
      var selectionNumber = value.selectionNumber;
      $('#artist_' + selectionNumber).val(value.artist);
      $('#title_' + selectionNumber).val(value.title);
      $('#update_' + selectionNumber).show();
    });
  });  
}