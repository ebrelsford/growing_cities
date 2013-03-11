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
                        $.get(layer.feature.properties.popup_url, function(data) {
                            layer.bindPopup(data, {
                                autoPan: false,
                            }).openPopup();
                        });

                        // center rather than fit popup
                        instance.map.panTo(layer.getLatLng());
                    });
                },

                pointToLayer: function(data, latlng) {
                    latlngs.push(latlng);
                    return new L.marker(latlng);
                },

            });

            $.get(instance.options.placesUrl, function(collection) {
                instance.feature_layer.addData(collection);
                instance.map.addLayer(instance.feature_layer);
                instance.map.fitBounds(new L.LatLngBounds(latlngs));
            });

        },

        openPlace: function(id) {
            var instance = this;
            $.each(instance.feature_layer._layers, function(i, layer) {
                if (layer.feature.id == id) {
                    layer.fire('click');
                }
            });
        },

        zoomTo: function(bbox) {
            var instance = this;
            instance.map.fitBounds([
                [bbox[1], bbox[0]],
                [bbox[3], bbox[2]],
            ]);
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
