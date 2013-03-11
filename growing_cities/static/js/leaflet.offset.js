//
// Map with offset center, for maps with overlays on one side.
//
// Adapted from https://github.com/Leaflet/Leaflet/issues/859
//
MapCenterOffsetMixin = {

    getBounds: function() {
        var offset = this._getOffset();
        var a=this.getPixelBounds(),
            b=this.unproject(new L.Point(a.min.x + offset[0],
                        a.max.y + offset[1]), this._zoom, true),
            c=this.unproject(new L.Point(a.max.x, a.min.y), this._zoom, true);
            return new L.LatLngBounds(b, c)
    },

    _getOffset: function() {
        var $drawer = this.options.$drawer;
        if (!$drawer.hasClass('is-open')) { return [0, 0]; }
        return [$drawer.outerWidth(), 0];
    },

    _latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
        var offset = this._getOffset();
        var targetPoint = this.project(newCenter, newCenter)
            .subtract([offset[0] / 2, offset[1] / 2]);
        var newCenter = this.unproject(targetPoint, newZoom);
        var topLeft = this._getNewTopLeftPoint(newCenter, newZoom)
            .add(this._getMapPanePos());
        return this.project(latlng, newZoom)._subtract(topLeft);
    },

    _getCenterLayerPoint: function () {
        var offset = this._getOffset();
        return this.containerPointToLayerPoint(this.getSize().divideBy(2)
                    .add([offset[0]/2, offset[1]/2]));
    },

    _resetView: function (center, zoom, preserveMapOffset, afterZoomAnim) {
        var zoomDiffers = this._zoom !== zoom;
        var offset = this._getOffset();

        // Change the center
        var targetPoint = this.project(center, zoom)
            .subtract([offset[0] / 2, offset[1]/2]);
        var center = this.unproject(targetPoint, zoom);
        afterZoomAnim || (this.fire("movestart"), zoomDiffers && this.fire("zoomstart")), this._zoom = zoom, this._initialTopLeftPoint = this._getNewTopLeftPoint(center);

        if (!preserveMapOffset) {
            L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
        }
        else {
            var f = L.DomUtil.getPosition(this._mapPane);
            this._initialTopLeftPoint._add(f)
        }
        this._tileLayersToLoad = this._tileLayersNum, this.fire("viewreset", {
            hard: !preserveMapOffset
        }), this.fire("move"), (zoomDiffers || afterZoomAnim) && this.fire("zoomend"), this.fire("moveend"), this._loaded || (this._loaded = true, this.fire("load"));
    }

}

L.Map.include(MapCenterOffsetMixin);
