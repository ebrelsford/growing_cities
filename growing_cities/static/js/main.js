/**************************************************************************** 
 * main.js
 *
 * Global glue functions that could be used on any page on the site.
 *
 ****************************************************************************/


function pxToInt(px) {
    return parseInt(px.replace('px', ''));
}


/*
 * Let things that want to take up the full height of the window do so.
 */
function setHeights() {
    var height = $(window).height();

    $('#application-pane-wrapper').outerHeight($(window).height() - 15);

    var $applicationPane = $('#application-pane');

    var innerDivHeight = $applicationPane.innerHeight() -
            pxToInt($applicationPane.css('padding-top')) -
            pxToInt($applicationPane.css('padding-bottom'));
    $applicationPane.find('.full-height')
        .outerHeight(innerDivHeight);

    $('#map').height(innerDivHeight - 4);
    $('#map-drawer').outerHeight(innerDivHeight - 4);
    $('#map-overlay').outerHeight(innerDivHeight);
}


/*
 * Map overlay.
 */

function showMapOverlay() {
    positionMapOverlay();
    $('#map-overlay').show();
}

function positionMapOverlay() {
    var $relativeTo = $('#content');
    $('#map-overlay')
        .width($relativeTo.outerWidth())
        .height($relativeTo.outerHeight())
        .position({
            my: 'left top',
            at: 'left top',
            of: $relativeTo,
        });
}

function hideMapOverlay() {
    $('#map-overlay').hide();
}


/*
 * Map drawer.
 */

function positionMapDrawer() {
    var relativeTo = '#content';
    var $drawer = $('#map-drawer');

    if (!$drawer.hasClass('is-open')) {
        relativeTo = '#sidebar';
        $drawer.outerWidth($(relativeTo).outerWidth());
    }
    $drawer
        .position({
            my: 'left top',
            at: 'left top',
            of: relativeTo,
        });
}

function showMapDrawer($mapDrawer) {
    var newWidth = $('#content').outerWidth() * .25;
    $mapDrawer
        .position({
            my: 'left top',
            at: 'left top',
            of: '#content',
            using: function(pos) {
                $mapDrawer.animate({
                    left: pos.left,
                    width: newWidth,
                });
            },
        })
        .addClass('is-open');
    $('#map-drawer-show').hide();

    // move any map controls on the left
    $('.leaflet-left').animate({
        left: newWidth,
    });
}

function hideMapDrawer($mapDrawer) {
    $mapDrawer
        .position({
            my: 'left top',
            at: 'left top',
            of: '#sidebar',
            using: function(pos) {
                $mapDrawer.animate({
                    left: pos.left, 
                    width: $('#sidebar').outerWidth(),
                });
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


/*
 * Submenu.
 */

function addSubmenu() {
    var $submenu = $('.submenu');
    if ($submenu.length === 0) return;

    // Find sections to add to the submenu
    $('#content h3').each(function() {
        var text = $(this).text();
        var $li = $('<li></li>');
        $li.append(
            $('<a></a>')
                .attr('href', '#' + text)
                .text(text)
        );
        $submenu.find('ul').append($li);
    });

    // If nothing was found, jump out
    if ($submenu.find('li').length === 0) {
        $submenu.addClass('empty');
        return;
    }

    // Add ScrollTo to submenu items
    $submenu.find('a').click(function() {
        var headerText = $(this).text(); //.slice(1);
        var $target = $('#content h3:contains("' + headerText + '")');
        if (!$target.is(':visible')) {
            $target = $target.parents(':visible:eq(0)');
        }
        $target.ScrollTo({
            offsetTop: $submenu.outerHeight(),
        });
    });

    // Make sticky
    $submenu.waypoint('sticky', { 
        context: '#content-wrapper', 
        handler: function(direction) {
            if (direction === 'down') {
                // handle stuck
                $('.submenu.stuck')
                    .width($('#content').innerWidth())
                    .position({
                        my: 'left top',
                        at: 'left+2 top+1',
                        of: '#content-wrapper',
                    });
            }
            else {
                // handle unstuck
                $submenu.width('100%');
            }
        },
    });
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

function positionBuyButton() {
    $('#buy-button')
        .position({
            my: 'right bottom',
            at: 'right bottom',
            of: '#content-wrapper',
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

    // keep map overlay in the proper position
    $(window).smartresize(positionMapOverlay);

    $(window).smartresize(positionBuyButton);

    addSubmenu();
    $(window).on('statechangecomplete', addSubmenu);

    $('input, textarea').placeholder();

    $('#map-city').chosen();

    $('.map-overlay-hide').click(function() {
        hideMapOverlay();

        // zoom to detected location
        if (lat && lon) {
            $('#map').placemap('centerOn', lat, lon);
        }
        else {
            // TODO ask browser for location
        }

        $('#map').placemap('toggleMapDrawer');
        return false;
    });
    $(window).on('statechangestart', hideMapOverlay);

    if ($('#map').length === 1) {
        showMapOverlay();
    }

    positionBuyButton();

    // Get ready for zooming
    var lat = null, 
        lon = null;
    findLocationByIP(function(data) {
        lat = data['latitude'];
        lon = data['longitude'];
    });

});
