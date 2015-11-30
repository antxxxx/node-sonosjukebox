/* 
 * this is javascript that is run in the browser
 */

$('ul.nav.nav-tabs').each(function () {
  var $active;
  $active = $("#DefaultSelection");
  // For each set of tabs, we want to keep track of
  // which tab is active and it's associated content

  $("#LetterSelection").hide();
  // Bind the click event handler
  $(this).on('click', 'a', function (e) {
    $active.removeClass('active');
    $active = $(this);
    $active.addClass('active');
    var url = '/api/jukebox/tracks/' + $(this)[0].text + '/';
    $.get(url, function (data) {
      $("#LetterSelection").show();
      $("#DefaultSelection").hide();
      for (i = 0; i < 9; i++) {
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

    // Prevent the anchor's default click action
    e.preventDefault();
  });
});

$.fn.onEnterKey =
function (closure) {
  $(this).keypress(
    function (event) {
      var code = event.keyCode ? event.keyCode : event.which;

      if (code == 13) {
        closure();
        return false;
      }
    });
};

$('#searchString').onEnterKey(
  function () {
    Search();
  });
$body = $("body");

$(document).on({
  ajaxStart: function () { $body.addClass("loading"); },
  ajaxStop: function () { $body.removeClass("loading"); }
});
GetConfig("sonos", "sonosip");
GetFavourites();