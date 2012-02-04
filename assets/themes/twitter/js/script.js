$(function() {
    // Clear and blur of search box on Esc press
    var $q = $('#q').bind('keydown', function(ev) {
        switch (ev.keyCode) {
        case 27:
            $q.val('').blur();
            break;
        }
    });

    // Focus of search box on '/' press
    $(window).bind('keydown', function(ev) {
        if (ev.keyCode == 191) {
            $q.focus();
        }
    });
});
