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
    GC.initializeCarousels();
    GC.trailer.initialize();
    GC.trailer.resize();
    GC.mobile.onStateChangeComplete();
    GC.setBodyClass();
    GC.mapDrawer.resize();
    GC.newsEntries.load();
};


/*
 * Handle resize events
 */
GC.onResize = function() {
    GC.setHeights();
    GC.mapDrawer.resize();
    GC.mapOverlay.position();
    GC.buyButton.position();
    GC.trailer.resize();
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

GC.setBodyClass = function() {
    if ($('#map').length > 0) {
        $('body').addClass('map-page');
    }
    else {
        $('body').removeClass('map-page');
    }
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

    resize: function() {
        // Make results scroll
        var $resultsContainer = $('.map-results-container');
        var $mapDrawer = $('#map-drawer');
        var availableHeight = $('#content-wrapper').innerHeight();

        // Calculate height elements that will be visible take up
        var takenHeight = 0;
        takenHeight += GC.pxToInt($mapDrawer.css('padding-top'));
        takenHeight += GC.pxToInt($mapDrawer.css('padding-bottom'));
        $resultsContainer.siblings().each(function() {
            takenHeight += $(this).outerHeight();
        });
        takenHeight += $resultsContainer.find('h3').outerHeight();
        takenHeight += GC.pxToInt($resultsContainer.css('padding-top'));
        takenHeight += GC.pxToInt($resultsContainer.css('padding-bottom'));

        $('#map-results').outerHeight(availableHeight - takenHeight);
    },

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

        // Resize drawer
        GC.mapDrawer.resize();
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

    resize: function() {
        var $trailer = $('#trailer-player'),
            availableHeight = $('#content-wrapper').height(),
            availableWidth = $('.article-content').width(),
            aspectRatio = $trailer.data('aspect-ratio');

        // Calculate the aspect ratio if we don't already have one
        if (!aspectRatio) {
            aspectRatio = $trailer.height() / $trailer.width();
            $trailer.data('aspect-ratio', aspectRatio);
        }

        // Try to make the trailer the full available width
        var newWidth = availableWidth,
            newHeight = newWidth * aspectRatio;

        // If this will make the trailer too tall, use the available height
        if (newHeight > availableHeight) {
            newHeight = availableHeight;
            newWidth = newHeight / aspectRatio;
        }
        $trailer
            .width(newWidth)
            .height(newHeight);
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
            search_contains: true,
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
                GC.submenu.scrollto(headerText);
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

    scrollto: function(headerText) {
        var $submenu = $('.submenu');
        var $target = $('#content h3:contains("' + headerText + '")');
        if (!$target.is(':visible')) {
            $target = $target.parents(':visible:eq(0)');
        }
        $target.ScrollTo({
            offsetTop: $submenu.outerHeight(),
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


GC.newsEntries = {

    load: function() {
        var $entriesContainer = $('.news-wordpress-container');
        $entriesContainer.addClass('is-loading');

        var url = '/news/entries/';
        $entriesContainer.load(url,
            function () {
                $entriesContainer.removeClass('is-loading');
                $entriesContainer.infinitescroll({
                    behavior: 'local',
                    binder: $('#content-wrapper'),
                    dataType: 'html',
                    itemSelector: '.wordpress-post',
                    loading: {
                        finishedMsg: 'No more entries.',
                        img: "data:image/gif;base64,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",
                        msgText: 'Loading more entries...',
                        speed: 'slow',
                    },
                    navSelector: '.news-wordpress-nav',
                    nextSelector: '.news-wordpress-nav a:first',
                    path: function (index) {
                        return url + '?page=' + index;
                    },
                });

            }
        );
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


GC.initializeCarousels = function() {
    var $carousels = $('.carousel');

    $carousels.each(function() {
        var $carousel = $(this);
        var loadPage = function(carousel, page_number) {
            carousel.lock();
            var url = $carousel.data('list-url') + '?page=' + page_number;
            $.get(url, function(html) {
                carousel.add(page_number, html);   
                carousel.unlock();
            });
        };

        $carousel.jcarousel({
            buttonNextHTML: '<div>&raquo;</div>',
            buttonPrevHTML: '<div>&laquo;</div>',
            itemLoadCallback: function(carousel, state) {
                for (var i = carousel.first; i <= carousel.last; i++) {
                    // Check if the item already exists
                    if (!carousel.has(i)) {
                        loadPage(carousel, i);
                    }
                }
            },
            scroll: 1,
            size: $carousel.data('list-pages'),
            visible: 1,
        });
    });
};


GC.mobile = {

    initialize: function() {
        GC.device_mobile = ($(window).width() <= 480);

        // Always initialize menu bar, in case screen shrinks to that size
        GC.mobile.initializeMenuBar();
    },

    initializeMenuBar: function() {
        $('#mobile-menu-bar').click(function() {
            $('#sidebar').show();
            $('#content-wrapper').hide();
        });
    },

    onStateChangeComplete: function() {
        if (GC.device_mobile) {
        }
    },

    onStateChangeStart: function() {
        if (GC.device_mobile) {
            $('#content-wrapper').show();
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
    $('#map-city').chosen({
        search_contains: true,
    });
    $('#map-activities').chosen({
        search_contains: true,
    });
    GC.addLocationForm.load();

    if ($('#map').length === 1) {
        GC.mapOverlay.show();
    }


    /*
     * Things that should happen on every page load.
     */
    GC.setHeights();
    GC.submenu.initialize();
    GC.submenu.scrollto(window.location.hash.slice(1));
    GC.findLocationByIP();
    GC.updateWatchTheTrailerButton();
    $('input[type=text], textarea').placeholder();
    GC.contactForm.load();
    GC.hostScreeningForm.load();
    GC.initializeFileInputs();
    GC.initializeForms();
    GC.initializeCarousels();
    GC.trailer.initialize();
    GC.trailer.resize();
    GC.setBodyClass();
    GC.mapDrawer.resize();
    GC.newsEntries.load();

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
