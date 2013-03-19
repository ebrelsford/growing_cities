/**************************************************************************** 
 * main.js
 *
 * Global glue functions that could be used on any page on the site.
 *
 ****************************************************************************/


/*
 * Let things that want to take up the full height of the window do so.
 */
function setHeights() {
    var height = $(window).height();
    $('#map').outerHeight(height);
    $('.full-height').outerHeight(height);
}


/*
 * Map overlay.
 */

function showMapOverlay() {
    var $relativeTo = $('#content');
    $('#map-overlay')
        .width($relativeTo.outerWidth())
        .height($relativeTo.outerHeight())
        .position({
            my: 'left top',
            at: 'left top',
            of: $relativeTo,
        })
        .show();
}

function hideMapOverlay() {
    $('#map-overlay').hide();
}


/*
 * Map drawer.
 */

function positionMapDrawer() {
    var relativeTo = '#content';
    if ($('#map-drawer:not(.is-open)')) relativeTo = '#sidebar';
    $('#map-drawer.is-open').position({
        my: 'left top',
        at: 'left top',
        of: relativeTo,
    });
}

function showMapDrawer($mapDrawer, $map) {
    $mapDrawer
        .position({
            my: 'left top',
            at: 'left top',
            of: '#content',
            using: function(pos) {
                $mapDrawer.animate({ left: pos.left, });
            },
        })
        .addClass('is-open');
    $('#map-drawer-show').hide();

    // move any map controls on the left
    $('.leaflet-left').animate({
        left: $mapDrawer.outerWidth(),
    });
}

function hideMapDrawer($mapDrawer, $map) {
    $mapDrawer
        .position({
            my: 'left top',
            at: 'left top',
            of: '#sidebar',
            using: function(pos) {
                $mapDrawer.animate({ left: pos.left, });
            },
        })
        .removeClass('is-open');

    $('#map-drawer-show')
        .show()
        .position({
            my: 'left top',
            at: 'left top',
            of: '#content',
        });

    // return any map controls on the left back to normal
    $('.leaflet-left').animate({
        left: 0,
    });
}

function enableMapDrawerTogglers() {
    $('#map-drawer-show')
        .show()
        .position({
            my: 'left top',
            at: 'left top',
            of: '#content',
        });
    $('.map-drawer-toggle:not(.initialized)')
        .click(function(e) {
            var $mapDrawer = $('#map-drawer'),
                $map = $('#map');
            if ($mapDrawer.hasClass('is-open')) {
                hideMapDrawer($mapDrawer, $map);
            }
            else {
                showMapDrawer($mapDrawer, $map);
            }
            e.preventDefault();
            return false;
        })
        .addClass('initialized');
}


/*
 * Submenu.
 */

function addSubmenu() {
    if ($('.submenu').length) {
        $('#content h3').each(function() {
            var text = $(this).text();
            var $li = $('<li></li>');
            $li.append(
                $('<a></a>')
                    .attr('href', '#' + text)
                    .text(text)
            );
            $('.submenu ul').append($li);
        });

        $('.submenu a').click(function() {
            var headerText = $(this).text().slice(1);
            var header = $('#content h3:contains("' + headerText + '")');
            header.ScrollTo({
                offsetTop: header.outerHeight(),   
            });
        });

        $('.submenu').waypoint('sticky', { context: '#content' });
    }
}


/*
 * Geolocation.
 */

function findLocationByIP(callback) {
    if (client_ip == '127.0.0.1') {
        // account for localhost
        client_ip = '173.3.193.143';
    }
    $.getJSON('http://freegeoip.net/json/' + client_ip, function(data) {
        callback(data);
    });
}


/*
 * Event handling and initialization.
 */

$(window).on('statechangestart', function(event) {
    // If map-drawer is out, hide it
    hideMapDrawer($('#map-drawer'), $('#map'));
});

$(document).ready(function() {

    // make sidebar and map take up entire window height
    setHeights();
    $(window).smartresize(setHeights);
    $(window).on('statechangecomplete', setHeights);

    // keep map drawer in the proper position
    positionMapDrawer();
    $(window).smartresize(positionMapDrawer);
    //$(window).on('statechangecomplete', positionMapDrawer);

    addSubmenu();
    $(window).on('statechangecomplete', addSubmenu);

    enableMapDrawerTogglers();
    $(window).on('statechangecomplete', enableMapDrawerTogglers);

    $('input, textarea').placeholder();

    $('.map-overlay-hide').click(function() {
        hideMapOverlay();

        // zoom to detected location
        if (lat && lon) {
            $('#map').placemap('centerOn', lat, lon);
        }
        else {
            // TODO ask browser for location
        }
 
        var $mapDrawer = $('#map-drawer'),
            $map = $('#map');
        showMapDrawer($mapDrawer, $map);
        return false;
    });

    // TODO only the first time
    showMapOverlay();

    // Get ready for zooming
    var lat = null, 
        lon = null;
    findLocationByIP(function(data) {
        lat = data['latitude'];
        lon = data['longitude'];
    });

});
