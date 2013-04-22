/**************************************************************************** 
 * main.js
 *
 * Global glue functions that could be used on any page on the site.
 *
 ****************************************************************************/

var GC = GC || {};

GC = {

    /*
     * Objects used throughout the site
     */
    trailer_player: null,

    /*
     * User state
     */
    map_center: null,
    map_zoom: null,
    play_trailer: false,
    user_lat: null,
    user_lon: null,
    user_ip: null,

};


/*
 * Ajax page loading events
 */

/*
 * Handle statechangestart event from ajaxpages
 */
GC.onStateChangeStart = function() {
    // If map-drawer is out, hide it
    GC.hideMapDrawer($('#map-drawer'), $('#map'));
    GC.mapOverlay.hide();

    // Prepare the loading indicator
    positionLoadingIndicator();

};

/*
 * Handle statechangecomplete event from ajaxpages
 */
GC.onStateChangeComplete = function() {
    GC.setHeights();
    GC.addSubmenu();
    findLocationByIP();
    GC.setRowHeights();
    GC.undoMakeRoomForTrailer();
    updateWatchTheTrailerButton();
    GC.initializeTrailer();
    initializeStoryForm();
    $('#map').placemap('toggleMapDrawer');

    $('input[type=text], textarea').placeholder();
    $('#content-wrapper').animate({ scrollTop: 0});
};


/*
 * Handle resize events
 */
GC.onResize = function() {
    GC.setHeights();
    GC.positionMapDrawer();
    GC.mapOverlay.position();
    GC.positionBuyButton();
};


/*
 * Utility--convert px string to integer
 */
GC.pxToInt = function(px) {
    return parseInt(px.replace('px', ''));
};


/*
 * Let things that want to take up the full height of the window do so.
 */
GC.setHeights = function() {
    var height = $(window).height();

    $('#application-pane-wrapper').outerHeight($(window).height() - 15);

    var $applicationPane = $('#application-pane');

    var innerDivHeight = $applicationPane.innerHeight() -
            GC.pxToInt($applicationPane.css('padding-top')) -
            GC.pxToInt($applicationPane.css('padding-bottom'));
    $applicationPane.find('.full-height')
        .outerHeight(innerDivHeight);

    $('#map').height(innerDivHeight - 4);
    $('#map-drawer').outerHeight(innerDivHeight - 4);
    $('#map-overlay').outerHeight(innerDivHeight);
};

GC.setRowHeights = function() {
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
};


/*
 * Map overlay.
 */
GC.mapOverlay = {

    position: function() {
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
            });
    },

    show: function() {
        GC.mapOverlay.position();
        $('#map-overlay').show();
    },

    hide: function() {
        $('#map-overlay').hide();
    },

};


/*
 * Map drawer.
 */

GC.positionMapDrawer = function() {
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
};


GC.showMapDrawer = function($mapDrawer) {
    var newWidth = $('#content').outerWidth() * .25;
    var innerWidth = newWidth - GC.pxToInt($mapDrawer.css('padding-left')) 
        - GC.pxToInt($mapDrawer.css('padding-right'));;

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
};


GC.hideMapDrawer = function($mapDrawer) {
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
};


/*
 * Clean up content area so the trailer is not obscured.
 */
GC.makeRoomForTrailer = function() {
    GC.hideBuyButton();
    GC.hideSubmenu();
}


/*
 * Re-show elements that were hidden for the trailer.
 */
GC.undoMakeRoomForTrailer = function() {
    GC.showBuyButton();
    GC.showSubmenu();
};


GC.initializeTrailer = function() {
    if ($('#trailer-player').length === 0) return;

    GC.trailer_player = $f($('#trailer-player')[0]);
    GC.trailer_player.addEvent('ready', function() {
        // Clean up page for trailer to play
        GC.trailer_player.addEvent('play', GC.makeRoomForTrailer);

        // Restore state of page when trailer is finished or paused.
        GC.trailer_player.addEvent('finish', GC.undoMakeRoomForTrailer);
        GC.trailer_player.addEvent('pause', GC.undoMakeRoomForTrailer);

        // Play it now if we should
        if (GC.play_trailer) {
            // Auto-play trailer
            GC.play_trailer = false;
            $('#trailer-player').ScrollTo();
            GC.trailer_player.api('play');
        }
    });
};


/*
 * Update the city selector based on the city name.
 */
GC.updateCitySelector = function(city) {
    // Update selected option
    $('#map-city option').removeAttr('selected');
    $('#map-city option:contains("' + city + '")').attr('selected', 'selected');

    // Let Chosen know that the input has changed
    $('#map-city').trigger('liszt:updated');
};


GC.moveToUserLocation = function(lat, lon) {
    $.getJSON('/growing_places/city/find/?' + $.param({
        lat: lat,
        lon: lon,
    }), function(data) {
        if (data.city !== null) {
            // Only bother if we have a city
            GC.updateCitySelector(data.city);
            $('#map').placemap('centerOn', lat, lon);
        }
    });
};


GC.initializeAddLocationPane = function() {
    $mapDrawer = $('#map-drawer');

    var $addPlaceForm = $('#add-place-form');
    $addPlaceForm
        .ajaxForm({
            target: $('#map-drawer-add-pane'), 
            success: function() {
                $(document.body).ajaxify();
                initializeFiber();
                $(window).trigger('formajaxsuccess');
            },
        })
        .addplaceform({
            placemapSelector: '#map',
        });

    $mapDrawer.find('.add-place-cancel-button').click(function() {
        $mapDrawer
            .removeClass('add-location')
            .animate({ scrollTop: 0});
    });
};


GC.loadAddLocationPane = function() {
    $('#map-drawer-add-pane').load(
        $('#map-drawer-add-pane').data('form-url'),
        GC.initializeAddLocationPane
    );
};


/*
 * Submenu.
 */


GC.hideSubmenu = function() {
    $('.submenu').hide();
};


GC.showSubmenu = function() {
    $('.submenu').show();
    GC.positionSubmenu();
};


GC.positionSubmenu = function() {
    $('.submenu.stuck')
        .width($('#content').innerWidth())
        .position({
            my: 'left top',
            at: 'left+2 top+1',
            of: '#content-wrapper',
        });
};


GC.addSubmenu = function() {
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
};


/*
 * Loading indicator.
 */
function positionLoadingIndicator() {
    $('.loading-indicator').position({
        my: 'center center',
        at: 'center center',
        of: '#content-wrapper',
    });
};


/*
 * Geolocation.
 */

function findLocationByIP() {
    if (GC.user_ip === null || GC.user_ip === '127.0.0.1') return;
    $.getJSON('http://freegeoip.net/json/' + GC.user_ip, function(data) {
        GC.user_lat = data['latitude'];
        GC.user_lon = data['longitude'];
    });
}


GC.positionBuyButton = function() {
    $('#buy-button')
        .position({
            my: 'right bottom',
            at: 'right bottom',
            of: '#content-wrapper',
        });
};


GC.hideBuyButton = function() {
    $('#buy-button').hide();
};


GC.showBuyButton = function() {
    $('#buy-button').show();
    GC.positionBuyButton();
};


/*
 * Watch the Trailer / Back to Map button.
 */

function updateWatchTheTrailerButton() {
    if ($('#map').length >= 1) {
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
};


function initializeWatchTheTrailerButton() {
    // Update status so that Trailer will play when the state changes
    $('.trailer-map-button')
        .click(function() {
            if ($('#map').length >= 1) {
                GC.play_trailer = true;
            }
        });
};


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
};


/*
 * Event handling and initialization.
 */


$(window).on('statechangestart', GC.onStateChangeStart);
$(window).on('statechangecomplete', GC.onStateChangeComplete);

// Triggered on ajaxForm success
$(window).on('formajaxsuccess', initializeStoryForm);
$(window).on('formajaxsuccess', function() {
    GC.initializeAddLocationPane();
    $('.add-place-success-button').click(function() {
        $('#map-drawer').removeClass('add-location');
        GC.loadAddLocationPane();
    });   
});

$(window).load(function() {
    // Make grid elements that should have the same height match
    GC.setRowHeights();

    // Initialize watch the trailer/back to map button
    initializeWatchTheTrailerButton();
});

$(document).ready(function() {
    GC.setHeights();
    GC.positionMapDrawer();
    $(window).smartresize(GC.onResize);

    GC.addSubmenu();

    initializeStoryForm();
    GC.initializeTrailer();

    $('input[type=text], textarea').placeholder();

    $('#map-city').chosen();
    $('#map-activities').chosen();

    $('.map-overlay-hide').click(function() {
        GC.mapOverlay.hide();

        $('#map').placemap('locate', 
            function(event) {
                // Success: zoom to Geolocation API-detected location
                GC.moveToUserLocation(event.latlng.lat, event.latlng.lng);
            },
            function() {
                // Fallback: zoom to IP-detected location
                GC.moveToUserLocation(GC.user_lat, GC.user_lon);
            }
        );

        $('#map').placemap('toggleMapDrawer');
        return false;
    });

    if ($('#map').length === 1) {
        GC.mapOverlay.show();
    }

    GC.positionBuyButton();
    updateWatchTheTrailerButton();

    // Get ready for zooming
    findLocationByIP();

    $('.add-place-button').click(function() {
        $('#map-drawer')
            .addClass('add-location')
            .animate({ scrollTop: 0});
    });

    GC.loadAddLocationPane();
});
