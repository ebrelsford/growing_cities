//
// Map with offset center, for maps with overlays on one side.
//
// Adapted from https://github.com/Leaflet/Leaflet/issues/859
//
MapCenterOffsetMixin = {
    
    // TODO make dynamic based on whether drawer is open or not
    UIOffset: [346, 0], // x, y

    getBounds: function(){
        var a=this.getPixelBounds(),
            b=this.unproject(new L.Point(a.min.x + this.UIOffset[0],
                        a.max.y + this.UIOffset[1]), this._zoom, true),
            c=this.unproject(new L.Point(a.max.x, a.min.y), this._zoom, true);
            return new L.LatLngBounds(b, c)
    },

    _latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
        var targetPoint = this.project(newCenter, newCenter)
            .subtract([this.UIOffset[0] / 2, this.UIOffset[1] / 2]);
        var newCenter = this.unproject(targetPoint, newZoom);
        var topLeft = this._getNewTopLeftPoint(newCenter, newZoom)
            .add(this._getMapPanePos());
        return this.project(latlng, newZoom)._subtract(topLeft);
    },

    _getCenterLayerPoint: function () {
        return this.containerPointToLayerPoint(this.getSize().divideBy(2)
                    .add([this.UIOffset[0]/2, this.UIOffset[1]/2]));
    },

    _resetView: function (center, zoom, preserveMapOffset, afterZoomAnim) {
        var zoomDiffers = this._zoom !== zoom;

        // Change the center
        var targetPoint = this.project(center, zoom)
            .subtract([this.UIOffset[0] / 2, this.UIOffset[1]/2]);
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
