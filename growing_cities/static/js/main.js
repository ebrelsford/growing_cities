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
     * Device info
     */
    device_mobile: false,

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
    GC.mapDrawer.hide($('#map-drawer'), $('#map'));
    GC.mapOverlay.hide();

    // Prepare the loading indicator
    GC.positionLoadingIndicator();

    // Do any mobile-related things
    GC.mobile.onStateChangeStart();
};

/*
 * Handle statechangecomplete event from ajaxpages
 */
GC.onStateChangeComplete = function() {
    $('#content-wrapper').scrollTop(0);
    GC.setHeights();
    GC.submenu.initialize();
    GC.findLocationByIP();
    GC.trailer.undoMakeRoom();
    GC.updateWatchTheTrailerButton();
    $('#map').placemap('toggleMapDrawer');
    $('input[type=text], textarea').placeholder();
    GC.contactForm.load();
    GC.hostScreeningForm.load();
    GC.initializeFileInputs();
    GC.initializeForms();
    GC.initializeStoryCarousel();
    GC.trailer.initialize();
    GC.mobile.onStateChangeComplete();
};


/*
 * Handle resize events
 */
GC.onResize = function() {
    GC.setHeights();
    GC.mapOverlay.position();
    GC.buyButton.position();
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


/*
 * Map overlay.
 */
GC.mapOverlay = {

    position: function() {
        var $relativeTo = $('#content-wrapper');
        $('#map-overlay')
            .width($relativeTo.innerWidth())
            .height($relativeTo.innerHeight())
            .position({
                my: 'left top',
                at: 'left+2 top+2',
                of: $relativeTo,
            });
    },

    show: function() {
        $('#map-overlay').show();
        GC.mapOverlay.position();
    },

    hide: function() {
        $('#map-overlay').hide();
    },

};


/*
 * Map drawer.
 */
GC.mapDrawer = {

    position: function() {
        var relativeTo = '#content';
        var $drawer = $('#map-drawer');

        if (!$drawer.hasClass('is-open')) {
            relativeTo = '#sidebar';
            $drawer.outerWidth($(relativeTo).outerWidth());
        }
        $drawer
            .position({
                my: 'left top',
                at: 'left top+2',
                of: relativeTo,
            });
    },

    show: function($mapDrawer) {
        if (GC.device_mobile) return;
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

        // move top map controls on the left
        $('.leaflet-left.leaflet-top').animate({
            left: newWidth,
        }, 'fast');
    },

    hide: function($mapDrawer) {
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
    },

};


GC.trailer = {

    initialize: function() {
        if ($('#trailer-player').length === 0) return;

        GC.trailer_player = $f($('#trailer-player')[0]);
        GC.trailer_player.addEvent('ready', function() {
            // Clean up page for trailer to play
            GC.trailer_player.addEvent('play', GC.trailer.makeRoom);

            // Restore state of page when trailer is finished or paused.
            GC.trailer_player.addEvent('finish', GC.trailer.undoMakeRoom);
            GC.trailer_player.addEvent('pause', GC.trailer.undoMakeRoom);

            // Play it now if we should
            if (GC.play_trailer) {
                // Auto-play trailer

                // NB: This does not work when the Film page is initially
                // loaded, the map page is loaded, then the "Watch the Trailer"
                // button is invoked. But it does work from every other page.
                GC.play_trailer = false;
                $('#trailer-player').ScrollTo();
                GC.trailer_player.api('play');
            }
        });
    },

    /*
     * Clean up content area so the trailer is not obscured.
     */
    makeRoom: function() {
        GC.buyButton.hide();
        GC.submenu.hide();
    },

    /*
    * Re-show elements that were hidden for the trailer.
    */
    undoMakeRoom: function() {
        GC.buyButton.show();
        GC.submenu.show();
    },

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
    if (!(lat && lon)) return;
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


GC.addLocationForm = {
    load: function() {
        var $formWrapper = $('#map-drawer-add-pane');
        $formWrapper.load($formWrapper.data('form-url'), function() {
            $(document.body).ajaxify();
            GC.addLocationForm.initialize();
        });
    },

    initialize: function() {
        var selector = '#add-place-form';
        $(selector).find('.add-place-activities select').chosen({ 
            width: '100%',
        });
        $(selector).addplaceform({
            placemapSelector: '#map',
        });

        GC.initializeFileInputs();
        GC.initializeForms();

        $mapDrawer = $('#map-drawer');
        $mapDrawer.find('.add-place-cancel-button').click(function() {
            $mapDrawer
                .removeClass('add-location')
                .scrollTop(0);
        });

    },

};


/*
 * Submenu.
 */

GC.submenu = {

    initialize: function() {
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
    },

    position: function() {
        $('.submenu.stuck')
            .width($('#content').innerWidth())
            .position({
                my: 'left top',
                at: 'left+2 top+1',
                of: '#content-wrapper',
            });
    },

    hide: function() {
        $('.submenu').hide();
    },

    show: function() {
        if (GC.device_mobile) return;
        $('.submenu').show();
        GC.submenu.position();
    },

};


/*
 * Loading indicator.
 */
GC.positionLoadingIndicator = function() {
    var relativeTo = '#content-wrapper';
    if (GC.device_mobile) relativeTo = 'body';

    $('.loading-indicator').position({
        my: 'center center',
        at: 'center center',
        of: relativeTo,
    });
};


/*
 * Geolocation.
 */

GC.findLocationByIP = function() {
    if (GC.user_ip === null || GC.user_ip === '127.0.0.1') return;
    $.getJSON('http://freegeoip.net/json/' + GC.user_ip, function(data) {
        GC.user_lat = data['latitude'];
        GC.user_lon = data['longitude'];
    });
};


GC.buyButton = {

    position: function() {
        $('#buy-button')
            .position({
                my: 'right bottom',
                at: 'right bottom',
                of: '#content-wrapper',
            });
    },

    hide: function() {
        $('#buy-button').hide();
    },

    show: function() {
        if (GC.device_mobile) return;
        $('#buy-button').show();
        GC.buyButton.position();
    },

};


/*
 * Watch the Trailer / Back to Map button.
 */

GC.updateWatchTheTrailerButton = function() {
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


GC.initializeWatchTheTrailerButton = function() {
    // Update status so that Trailer will play when the state changes
    $('.trailer-map-button')
        .click(function() {
            if ($('#map').length >= 1) {
                GC.play_trailer = true;
            }
        });
};


GC.initializeForms = function() {
    $('form').not('.initialized')
        .submit(function() {
            $(this).find('button[type=submit]').attr('disabled', 'disabled');
            $(this).addClass('submitting');
        })
        .addClass('initialized');
};

/*
 * Story form
 */

GC.initializeFileInputs = function() {
    $('input[type=file]').change(function() {
        if (!$(this).val()) return;

        // Try to get a nicer filename to display
        var filename = $(this).val();
        if (filename.indexOf("\\") >= 0) {
            filename = filename.split("\\").pop();
        }
        $(this).parent().find('.image-input-button').hide();
        $(this).parent().find('.image-input-selected-file').text(filename).show();
    });
};


GC.contactForm = {

    load: function() {
        // Load the form first if it doesn't exist
        var $formWrapper = $('#contact-form-wrapper');
        $formWrapper.load($formWrapper.data('form-url'), function() {
            $(document.body).ajaxify();
            GC.contactForm.initialize();
        });
    },

    initialize: function() {
        GC.initializeForms();
    },

};


GC.hostScreeningForm = {

    load: function() {
        var $formWrapper = $('#host-screening-form-wrapper');
        $formWrapper.load($formWrapper.data('form-url'), function() {
            $(document.body).ajaxify();
            GC.hostScreeningForm.initialize();
        });
    },

    initialize: function() {
        GC.initializeForms();

        var $formWrapper = $('#host-screening-form-wrapper');

        $formWrapper.find('#id_date').datepicker({
            minDate: 0,
        });

        $formWrapper.find('#id_time').timePicker({
            show24Hours: false,
        });
    },

};


GC.initializeStoryCarousel = function() {
    var $carouselWrapper = $('.story-list-wrapper');

    var loadStoryPage = function(carousel, page_number) {
        carousel.lock();
        var url = $carouselWrapper.data('list-url') + '?page=' + page_number;
        $.get(url, function(html) {
            carousel.add(page_number, html);   
            carousel.unlock();
        });
    };

    $carouselWrapper.jcarousel({
        buttonNextHTML: '<div>&raquo;</div>',
        buttonPrevHTML: '<div>&laquo;</div>',
        itemLoadCallback: function(carousel, state) {
            for (var i = carousel.first; i <= carousel.last; i++) {
                // Check if the item already exists
                if (!carousel.has(i)) {
                    loadStoryPage(carousel, i);
                }
            }
        },
        scroll: 1,
        size: $carouselWrapper.data('list-pages'),
        visible: 1,
    });
};


GC.mobile = {

    initialize: function() {
        GC.device_mobile = ($(window).width() <= 480);
        if (GC.device_mobile) {
            GC.mobile.initializeMenuBar();
        }
    },

    initializeMenuBar: function() {
        $('#mobile-menu-bar').click(function() {
            $('#sidebar').show();
        });
    },

    onStateChangeComplete: function() {
        if (GC.device_mobile) {
        }
    },

    onStateChangeStart: function() {
        if (GC.device_mobile) {
            $('#sidebar').hide();
        }
    },

};


/*
 * Event handling and initialization.
 */


$(window).on('statechangestart', GC.onStateChangeStart);
$(window).on('statechangecomplete', GC.onStateChangeComplete);

// Triggered on ajaxForm success
$(window).on('formajaxsuccess', GC.addLocationForm.initialize);
$(window).on('formajaxsuccess', GC.contactForm.initialize);
$(window).on('formajaxsuccess', GC.hostScreeningForm.initialize);
$(window).on('formajaxsuccess', GC.initializeFileInputs);
$(window).on('formajaxsuccess', GC.initializeForms);
$(window).on('formajaxsuccess', function() {
    $('.add-place-success-button').click(function() {
        $('#map-drawer').removeClass('add-location');
        GC.addLocationForm.load();
    });   
});

$(window).load(function() {
    // Buy button likes to have other things positioned first
    GC.buyButton.position();
});

$(document).ready(function() {
    /*
     * Things that should only have to happen once, on the initial load.
     */
    GC.mobile.initialize();
    GC.mapDrawer.position();
    $(window).smartresize(GC.onResize);
    GC.initializeWatchTheTrailerButton();
    $('#map-city').chosen();
    $('#map-activities').chosen();
    GC.addLocationForm.load();

    if ($('#map').length === 1) {
        GC.mapOverlay.show();
    }


    /*
     * Things that should happen on every page load.
     */
    GC.setHeights();
    GC.submenu.initialize();
    GC.findLocationByIP();
    GC.updateWatchTheTrailerButton();
    $('input[type=text], textarea').placeholder();
    GC.contactForm.load();
    GC.hostScreeningForm.load();
    GC.initializeFileInputs();
    GC.initializeForms();
    GC.initializeStoryCarousel();
    GC.trailer.initialize();

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

    $('.add-place-button').click(function() {
        $('#map-drawer')
            .addClass('add-location')
            .scrollTop(0);
    });
});
