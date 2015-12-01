/* 
 * this is javascript that is run in the browser
 */

// handle the tabs for letter display
$('ul.nav.nav-tabs').each(function () {
  var $active;
  $active = $("#DefaultSelection");
  $("#LetterSelection").hide();
  // Bind the click event handler
  $(this).on('click', 'a', function (e) {
    $active.removeClass('active');
    $active = $(this);
    $active.addClass('active');
    displayAssignments( $(this)[0].text);

    // Prevent the anchor's default click action
    e.preventDefault();
  });
});

// function to do something when enter pressed in a box
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

// when return pressed on search then run search
$('#searchString').onEnterKey(
  function () {
    Search();
  });
  
// display loading when making api calls
$body = $("body");

$(document).on({
  ajaxStart: function () { $body.addClass("loading"); },
  ajaxStop: function () { $body.removeClass("loading"); }
});

// initial page setup
GetConfig("sonos", "sonosip");
GetFavourites();