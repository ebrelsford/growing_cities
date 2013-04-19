(function (window, $, undefined) {
    "use strict";

    $.placemap = function(options, element) {
        this.element = $(element);
        if (!this._create(options)) {
            this.failed = true;
        }
    };

    $.placemap.defaults = {
        apiKey: null,
        initialCenter: null,
        initialZoom: null,
        styleId: null,
    };

    $.placemap.prototype = {

        _create: function(options) {
            // Add custom options to defaults
            var opts = $.extend(true, {}, $.placemap.defaults, options);
            this.options = opts;
            var $window = $(window);
            var instance = this;

            instance._initializeMap();

            return true;
        },

        _initializeMap: function() {
            var instance = this;
            instance.map = L.map(instance.element[0].id, {
                $drawer: instance.options.$drawer,   
                mapDrawerControl: true,

                // If initial center/zoom given, use them (both default to null)
                center: instance.options.initialCenter,
                zoom: instance.options.initialZoom,
            });

            var cloudmade = new L.TileLayer(
                'http://{s}.tile.cloudmade.com/{apiKey}/{styleId}/256/{z}/{x}/{y}.png', 
                {
                    apiKey: instance.options.apiKey,
                    attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
                    maxZoom: 18,
                    styleId: instance.options.styleId,
                }
            );

            instance.map.addLayer(cloudmade);

            var latlngs = [];
            instance.feature_layer = new L.GeoJSON(null, {

                onEachFeature: function(data, layer) {
                    layer.on('click', function(e) {
                        var popupHeight = 200;

                        // TODO on click, make icon active
                        // TODO on de-select, make icon inactive
                        $.get(layer.feature.properties.popup_url, function(data) {
                            layer.bindPopup(data, {
                                autoPan: false,
                                maxHeight: popupHeight,
                            }).openPopup();
                        });

                        // Center popup rather than fit popup.
                        var pt = instance.map.latLngToLayerPoint(layer.getLatLng());
                        var ll = instance.map.layerPointToLatLng([
                            pt.x,
                            pt.y - popupHeight * .5
                        ]);
                        instance.map.panTo(ll);
                    });
                },

                pointToLayer: function(data, latlng) {
                    latlngs.push(latlng);
                    return new L.marker(latlng, { icon: instance.icon, });
                },

            });

            $.get(instance.options.placesUrl, function(collection) {
                instance.feature_layer.addData(collection);
                instance.map.addLayer(instance.feature_layer);

                // If initial center/zoom not given, fit points in viewport
                if (!(instance.options.initialCenter 
                        && instance.options.initialZoom)) {
                    instance.map.fitBounds(new L.LatLngBounds(latlngs));
                }
            });

        },

        icon: L.divIcon({
            className: 'map-marker',  
            iconSize: [34, 44],
            iconAnchor: [17, 44],
            popupAnchor: [0, -44],
        }),

        openPlace: function(id) {
            var instance = this;
            $.each(instance.feature_layer._layers, function(i, layer) {
                if (layer.feature.id == id) {
                    layer.fire('click');
                }
            });
        },

        centerOn: function(lat, lon) {
            var instance = this;
            instance.map.setView([lat, lon], 12);
        },

        locate: function(successCallback, errorCallback) {
            var instance = this;

            instance.map.on('locationfound', successCallback);
            instance.map.on('locationerror', errorCallback);

            instance.map.locate();
        },

        zoomTo: function(bbox) {
            var instance = this;
            instance.map.fitBounds([
                [bbox[1], bbox[0]],
                [bbox[3], bbox[2]],
            ]);
        },

        toggleMapDrawer: function() {
            // call control's toggleMapDrawer using the map as its context 
            this.map.mapDrawerControl.toggleMapDrawer.call(this.map);
        },

        addPoint: function(lat, lng) {
            var instance = this;
            var marker = L.marker([lat, lng], {
                icon: instance.icon
            });
            var popupId = 'added-location-popup-content';
            marker.bindPopup(
                '<div id="' + popupId + '">' +
                    '<div>' +
                        '<h3 class="name"></h3>' +
                        '<div class="address meta"></div>' +
                        '<div class="mission"></div>' +
                    '</div>' +
                    '<div class="website-link meta">' +
                        '<a target="_blank">read more &#187;</a>' +
                    '</div>' +
                '</div>', 
                {
                    maxHeight: 200,
                    minWidth: 250,
                }
            );

            instance.addedPlaces = L.layerGroup([marker,])
                .addTo(instance.map);
            marker.openPopup();
            return popupId;
        },

        removeAddedPoints: function() {
            var instance = this;
            try {
                instance.addedPlaces.clearLayers();
                instance.addedPlaces = null;
            }
            catch (Exception) {}
        },

    }; // prototype

    $.fn.placemap = function(options) {
        var thisCall = typeof options;

        switch (thisCall) {

            // method 
            case 'string':
                var args = Array.prototype.slice.call(arguments, 1);

                this.each(function() {
                    var instance = $.data(this, 'placemap');

                    if (!instance) {
                        // not setup yet
                        return $.error('Method ' + options + 
                            ' cannot be called until placemap is setup');
                    }

                    if (!$.isFunction(instance[options]) ||
                            options.charAt(0) === "_") {
                        return $.error('No such method ' + options + ' for placemap');
                    }

                    // no errors!
                    return instance[options].apply(instance, args);
                });

                break;

            // creation 
            case 'object':

                this.each(function () {
                    var instance = $.data(this, 'placemap'); 
                    if (instance) {
                        // update options of current instance
                        instance.update(options);
                    } else {
                        // initialize new instance
                        instance = new $.placemap(options, this);

                        // don't attach if instantiation failed
                        if (!instance.failed) {
                            $.data(this, 'placemap', instance);
                        }
                    }
                });

                break;
        }
        return this;
    };

})(window, jQuery);
