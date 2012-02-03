$(function() {
    // Clear and blur of search box on Esc press
    var $q = $('#q').bind('keydown', function(ev) {
        if (ev.keyCode == 27) {
            $q.val('').blur();
            return false;
        }
    });

    // Focus of search box on '/' press
    $(window).bind('keydown', function(ev) {
        if (ev.keyCode == 191) {
            $q.focus();
            return false;
        }
    });
});
