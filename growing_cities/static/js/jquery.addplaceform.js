(function (window, $, undefined) {
    "use strict";

    $.addplaceform = function(options, element) {
        this.element = $(element);
        if (!this._create(options)) {
            this.failed = true;
        }
    };

    $.addplaceform.defaults = {
        apiKey: null,
        styleId: null,
    };

    $.addplaceform.prototype = {

        _create: function(options) {
            // Add custom options to defaults
            var opts = $.extend(true, {}, $.addplaceform.defaults, options);
            this.options = opts;
            var $window = $(window);
            var instance = this;

            // If the location changes, try to find it.
            instance.element.find('#id_location').change(function() {
                // Hide errors if any
                $(this).parent().find('.errorlist').remove();

                // Find the location entered
                instance.findLocation($(this).val());
            });

            // If any form input changes, add that to the popup.
            instance.element.find(':input').change(function() {
                instance.updateLocationPopup();
            });

            // When a location is found, update everything and add a popup
            instance.element.on('placelocationfound', function(event, placeLocation) {
                // Update (hidden) location-based form fields
                instance.updateLocationFields(placeLocation);

                // Add a marker to the map
                instance.addLocationMarker(placeLocation);

                // Center on the marker
                instance.centerOnLocation(placeLocation);

                // Update the popup for the marker
                instance.updateLocationPopup();
            });

            // Add an error message when no location is found.
            instance.element.on('placelocationerror', function(event, message) {
                var $locationInput = instance.element.find('#id_location');
                $locationInput.before(
                    $('<div/>')
                        .addClass('errorlist')
                        .text(message)
                );
            });

            return true;
        },


        /*
         * Add a marker to the map where the user is adding a location.
         */
        addLocationMarker: function(placeLocation) {
            var instance = this;
            instance.options.placemap.removeAddedPoints();
            instance.popupId = instance.options.placemap.addPoint(
                    placeLocation.latLng.lat, 
                    placeLocation.latLng.lng);
            instance.$popup = $('#' + instance.popupId);
        },


        /*
         * Attempt to find the location that the user is adding.
         */
        findLocation: function(query) {
            var instance = this;
            var url = 'http://www.mapquestapi.com/geocoding/v1/address?callback=?&' +
                'key=Fmjtd%7Cluub2107l9%2C72%3Do5-96t5uu&';
            var params = {
                'location': query,

                // Bias on the current viewport
                'boundingBox': instance._getCurrentBbox(),
            };
            url += $.param(params);

            $.getJSON(url, function(data) {
                var placeLocation = data.results[0].locations[0];
                if (instance._isValidLocation(placeLocation)) {
                    instance.element.trigger('placelocationfound', [placeLocation,]);
                }
                else {
                    instance.element.trigger('placelocationerror', 
                        ['That address was not found. Be more specific?',]);
                }
            });
        },


        _getCurrentBbox: function() {
            var instance = this;
            var bounds = instance.options.placemap.map.getBounds();
            // For Mapquest geocoding: north, west, south, east
            var bbox = [
                bounds.getNorthWest().lat,
                bounds.getNorthWest().lng,
                bounds.getSouthEast().lat,
                bounds.getSouthEast().lng,
            ];
            return bbox.join(',');
        },


        _isValidLocation: function(placeLocation) {
            return (placeLocation && placeLocation.adminArea3 !== '' && 
                    placeLocation.adminArea5 !== '' && 
                    placeLocation.street !== '');
        },


        /*
         * Center on the given location.
         */
        centerOnLocation: function(placeLocation) {
            var instance = this;
            instance.options.placemap.centerOn(placeLocation.latLng.lat, 
                    placeLocation.latLng.lng);
        },


        /*
         * Update the form's fields with the found location's information.
         */
        updateLocationFields: function(placeLocation) {
            $('#id_address_line1').val(placeLocation.street);
            $('#id_city').val(placeLocation.adminArea5);
            $('#id_state_province').val(placeLocation.adminArea3);
            $('#id_country').val(placeLocation.adminArea1);
            $('#id_postal_code').val(placeLocation.postalCode);
            $('#id_latitude').val(placeLocation.latLng.lat);
            $('#id_longitude').val(placeLocation.latLng.lng);
        },


        /*
         * Update the popup for the location using values from the form.
         */
        updateLocationPopup: function() {
            var instance = this;
            var $popup = instance.$popup;

            // Popup might not have been created yet
            if (!$popup || $popup.length === 0) return;

            $popup.find('.name').text(instance._inputValue('name'));
            $popup.find('.address').text(
                instance._inputValue('city') + ', ' +
                instance._inputValue('state_province')
            );
            $popup.find('.mission').text(instance._inputValue('mission'));
            $popup.find('.website-link a')
                .attr('href', instance._cleanUrl(instance._inputValue('url')));
        },

        _inputValue: function(name) {
            return this.element.find(':input[name=' + name + ']').val();
        },

        _cleanUrl: function(url) {
            if (url.indexOf('http') === -1) {
                url = 'http://' + url;
            }
            return url;
        },

    }; // prototype

    $.fn.addplaceform = function(options) {
        var thisCall = typeof options;

        switch (thisCall) {

            // method 
            case 'string':
                var args = Array.prototype.slice.call(arguments, 1);

                this.each(function() {
                    var instance = $.data(this, 'addplaceform');

                    if (!instance) {
                        // not setup yet
                        return $.error('Method ' + options + 
                            ' cannot be called until addplaceform is setup');
                    }

                    if (!$.isFunction(instance[options]) ||
                            options.charAt(0) === "_") {
                        return $.error('No such method ' + options + ' for addplaceform');
                    }

                    // no errors!
                    return instance[options].apply(instance, args);
                });

                break;

            // creation 
            case 'object':

                this.each(function () {
                    var instance = $.data(this, 'addplaceform'); 
                    if (instance) {
                        // update options of current instance
                        instance.update(options);
                    } else {
                        // initialize new instance
                        instance = new $.addplaceform(options, this);

                        // don't attach if instantiation failed
                        if (!instance.failed) {
                            $.data(this, 'addplaceform', instance);
                        }
                    }
                });

                break;
        }
        return this;
    };

})(window, jQuery);
