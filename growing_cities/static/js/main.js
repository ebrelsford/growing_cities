/**************************************************************************** 
 * main.js
 *
 * Global glue functions that could be used on any page on the site.
 *
 ****************************************************************************/

var user_lat = null, 
    user_lon = null,
    user_ip = null;


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

function setRowHeights() {
    var $rows = $('.match-row-heights');
    if ($rows.length === 0) return;

    var height = 0;
    $rows.each(function(i) {
        var $rowElements = $(this).find('.match-row-height');

        // Find the tallest element
        $rowElements.each(function(i) {
            var thisHeight = $(this).outerHeight();
            if (thisHeight > height) height = thisHeight;
        });

        // Make everything that tall
        $rowElements.each(function(i) {
            $(this).outerHeight(height);
        });
    });
}


/*
 * Map overlay.
 */

function showMapOverlay() {
    positionMapOverlay();
    $('#map-overlay').show();
}

function positionMapOverlay() {
    var $relativeTo = $('#content-wrapper');
    $('#map-overlay')
        .width($relativeTo.innerWidth() - 10)
        .height($relativeTo.innerHeight() - 2)
        .position({
            my: 'left top',
            at: 'left+2 top+2',
            of: $relativeTo,
            collision: 'fit fit',
            within: $relativeTo,
        })
        ;
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
    var innerWidth = newWidth - pxToInt($mapDrawer.css('padding-left')) 
        - pxToInt($mapDrawer.css('padding-right'));;

    $mapDrawer.find('#map-drawer-content').width(innerWidth);

    $mapDrawer.find('.chzn-container').width(innerWidth);
    $mapDrawer.find('.chzn-container input').width(innerWidth - 7);
    $mapDrawer.find('.chzn-container .chzn-drop').width(innerWidth);

    $mapDrawer
        .position({
            my: 'left top',
            at: 'left top',
            of: '#content',
            using: function(pos) {
                $mapDrawer.animate({
                    left: pos.left,
                    width: newWidth,
                }, 'fast');
            },
        })
        .addClass('is-open');

    // move any map controls on the left
    $('.leaflet-left').animate({
        left: newWidth,
    }, 'fast');
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
                }, 'fast');
            },
        })
        .removeClass('is-open');

    // return any map controls on the left back to normal
    $('.leaflet-left').animate({
        left: 0,
    }, 'fast');
}

/*
 * Update the city selector based on the city name.
 */
function updateCitySelector(city) {
    // Update selected option
    $('#map-city option').removeAttr('selected');
    $('#map-city option:contains("' + city + '")').attr('selected', 'selected');

    // Let Chosen know that the input has changed
    $('#map-city').trigger('liszt:updated');
}

function moveToUserLocation(lat, lon) {
    $.getJSON('/growing_places/city/find/?' + $.param({
        lat: lat,
        lon: lon,
    }), function(data) {
        if (data.city !== null) {
            // Only bother if we have a city
            updateCitySelector(data.city);
            $('#map').placemap('centerOn', lat, lon);
        }
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
        // Handle return-to-top link
        if ($(this).hasClass('submenu-top-link')) {
            $('#content-wrapper').animate({ scrollTop: 0});
        }
        else {
            var headerText = $(this).text();
            var $target = $('#content h3:contains("' + headerText + '")');
            if (!$target.is(':visible')) {
                $target = $target.parents(':visible:eq(0)');
            }
            $target.ScrollTo({
                offsetTop: $submenu.outerHeight(),
            });
        }
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
 * Loading indicator.
 */
function positionLoadingIndicator() {
    $('.loading-indicator').position({
        my: 'center center',
        at: 'center center',
        of: '#content-wrapper',
    });
}


/*
 * Geolocation.
 */

function findLocationByIP() {
    if (user_ip === null || user_ip === '127.0.0.1') return;
    $.getJSON('http://freegeoip.net/json/' + user_ip, function(data) {
        user_lat = data['latitude'];
        user_lon = data['longitude'];
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
 * Watch the Trailer / Back to Map button.
 */

function updateWatchTheTrailerButton() {
    if ($('#map').length >= 1) {
        // Watch the Trailer
        // TODO scroll to #Trailer
        $('.trailer-map-button')
            .removeClass('back-to-map')
            .attr('href', '/the-film/');
    }
    else {
        // Back to Map
        $('.trailer-map-button')
            .addClass('back-to-map')
            .attr('href', '/');
    }
}


/*
 * Story form
 */

function initializeStoryForm() {
    $('.story-form input[type=file]').change(function() {
        if (!$(this).val()) return;
        $('.image-input-button').hide();
        $('.image-input-selected-file').text($(this).val()).show();
    });

    $('.story-form-submit').click(function() {
        $('.story-form form').submit();
        return false;
    });
}


/*
 * Event handling and initialization.
 */

$(window).on('statechangestart', function(event) {
    // If map-drawer is out, hide it
    hideMapDrawer($('#map-drawer'), $('#map'));

    // Prepare the loading indicator
    positionLoadingIndicator();
});

$(window).on('statechangecomplete', addSubmenu);
$(window).on('statechangecomplete', findLocationByIP);
$(window).on('statechangecomplete', setHeights);
$(window).on('statechangecomplete', setRowHeights);
$(window).on('statechangecomplete', updateWatchTheTrailerButton);

$(window).on('statechangecomplete', initializeStoryForm);
// Triggered on ajaxForm success
$(window).on('formajaxsuccess', initializeStoryForm);

$(window).on('statechangecomplete', function() {
    $('input[type=text], textarea').placeholder();
    $('#content-wrapper').animate({ scrollTop: 0});
});

$(window).load(function() {
    // Make grid elements that should have the same height match
    setRowHeights();
});

$(document).ready(function() {

    // make sidebar and map take up entire window height
    setHeights();
    $(window).smartresize(setHeights);

    // keep map drawer in the proper position
    positionMapDrawer();
    $(window).smartresize(positionMapDrawer);

    // keep map overlay in the proper position
    $(window).smartresize(positionMapOverlay);

    $(window).smartresize(positionBuyButton);

    addSubmenu();

    initializeStoryForm();

    $('input[type=text], textarea').placeholder();

    $('#map-city').chosen();
    $('#map-activities').chosen();

    $('.map-overlay-hide').click(function() {
        hideMapOverlay();

        $('#map').placemap('locate', 
            function(event) {
                // Success: zoom to Geolocation API-detected location
                moveToUserLocation(event.latlng.lat, event.latlng.lng);
            },
            function() {
                // Fallback: zoom to IP-detected location
                moveToUserLocation(user_lat, user_lon);
            }
        );

        $('#map').placemap('toggleMapDrawer');
        return false;
    });
    $(window).on('statechangestart', hideMapOverlay);

    if ($('#map').length === 1) {
        showMapOverlay();
    }

    positionBuyButton();
    updateWatchTheTrailerButton();

    // Get ready for zooming
    findLocationByIP();

});
