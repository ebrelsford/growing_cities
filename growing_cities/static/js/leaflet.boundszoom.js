/*
 * Provides a way to fit bounds with a maximum zoom.
 */

L.Map.include({

    fitBoundsZoom: function(bounds, maxZoom, options) {
        // This is all exactly as fitBounds() works
		options = options || {};
		bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);

		var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR)),
		    paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.getSouthWest(), zoom),
		    nePoint = this.project(bounds.getNorthEast(), zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

        // Before we set the view pick the smaller zoom
        zoom = Math.min(zoom, maxZoom);

        // Back to regular programming...
		return this.setView(center, zoom, options);
   },

});
