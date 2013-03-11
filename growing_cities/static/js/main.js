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

});
