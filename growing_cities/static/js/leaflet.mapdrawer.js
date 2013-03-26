/*
 * Add toggle button for the map drawer to the zoom control area. 
 */

L.Control.MapDrawer = L.Control.extend({

    options: {
        position: 'topleft',
        title: 'Open / Close Map Drawer',
    },

    onAdd: function(map) {
		var containerClass = 'leaflet-control-zoom', className, container;
		if(map.zoomControl) {
			container = map.zoomControl._container;
			className = '-map-drawer map-drawer-toggle no-ajax leaflet-bar-part leaflet-bar-part-bottom last';
 
            // Update class of the zoom out button
            if (map.zoomControl._zoomOutButton) {
                L.DomUtil.removeClass(map.zoomControl._zoomOutButton,
                    'leaflet-bar-part-bottom');
            }
		} else {
			container = L.DomUtil.create('div', containerClass);
			className = '-map-drawer map-drawer-toggle';
		}

		this.button = this._createButton(this.options.title,
                containerClass + className, container, this.toggleMapDrawer, map);

		return container;
    },

	_createButton: function (title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
        link.innerHTML = '&#187;';
		link.title = title;

		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', fn, context);
        return link;
    },

    toggleMapDrawer: function() {
        var $drawer = this.options.$drawer;
        if ($drawer.hasClass('is-open')) {
            hideMapDrawer($drawer);
            this.mapDrawerControl.button.innerHTML = '&#187;';
        }
        else {
            showMapDrawer($drawer);
            this.mapDrawerControl.button.innerHTML = '&#171;';
        }
    },

});

L.Map.addInitHook(function () {
	if (this.options.mapDrawerControl) {
		this.mapDrawerControl = L.control.mapDrawer();
		this.addControl(this.mapDrawerControl);
	}
});

L.control.mapDrawer = function (options) {
	return new L.Control.MapDrawer(options);
};
