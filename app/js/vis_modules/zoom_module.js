window.zoomScale = 1;

var CircleUtils = require('./circle_module.js'),
    TextUtils = require('./text_module.js'),
    SelectionUtils = require('./selections_module.js');

var zoom,
    oldZoomScale = 1;

var ZoomUtils = {

  initZoom: function (w, h) {
    zoom = d3.behavior.zoom()
      .translate([0, 0])
      .center(null)
      .scaleExtent([1, 50])
      .size([w, h])
      .on("zoom", zoomed)
      .on("zoomstart", zoomStarted)
      .on("zoomend", zoomEnded);

    setGlobalZoomScale(zoom.scale());
  },

  getZoom: function () {
    return zoom;
  },

  getZoomScale: function () {
    return zoom.scale();
  }
};

function zoomStarted () {}

function zoomed () {
  SelectionUtils.getVis().attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function zoomEnded (e) {
  var zoomScale = zoom.scale();

  if (zoomScale === oldZoomScale) {
    d3.event && d3.event.sourceEvent ? d3.event.sourceEvent.preventDefault() : null;
    return;
  }
  setGlobalZoomScale(zoomScale);
  CircleUtils.updateCirclesAfterZoom();
  TextUtils.updateLabelsAfterZoom();
  oldZoomScale = zoomScale;
}

function setGlobalZoomScale (scale) {
  console.log("setting setGlobalZoomScale: ", scale);
  window.zoomScale = scale;
}


module.exports = ZoomUtils;