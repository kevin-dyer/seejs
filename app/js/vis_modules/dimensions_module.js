//var BubbleJS = require('./bubble_js_module.js'),
    //ZoomUtils = require('./zoom_module.js'),
    //SelectionUtils = require('./selections_module.js');

var container,
    w,
    h,
    r,
    resizeDelayTimer;

function getContainer () {
  if (!container) {
    container = document.getElementsByClassName("page-content")[0];
  }
  return container;
}

function setWidth () {
  w = getContainer().offsetWidth - 40;
}

function getWidth () {
  return w;
}

function setHeight () {
  h = getContainer().offsetHeight - 40;
}

function getHeight () {
  return h;
}

function setRadius () {
  r = w > h ? h : w;
}

function getRadius () {
  return r;
}

function setAllDimensions () {
  setWidth();
  setHeight();
  setRadius();
}

function transformToCenter () {
  return "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")";
}

// function resizeVis () {
//   setAllDimensions();
//   BubbleJS.getPack().size([r, r]);
//   ZoomUtils.getZoom.size([w, h]);
//   $("svg.bubble-chart").height(h).width(w);
//   $(".outter-g").attr("transform", transformToCenter());
//   SelectionUtils.getOutterG().call(zoom);
  
//   //Could cause trouble!
//   BubbleJS.update();
// }


var DimensionsUtils = {
  getContainer: getContainer,

  setWidth: setWidth,

  getWidth: getWidth,

  setHeight: setHeight,

  getHeight: getHeight,

  setRadius: setRadius,

  getRadius: getRadius,

  setAllDimensions: setAllDimensions,

  transformToCenter: transformToCenter
};

//TODO: move out into bubble.js
// $(window).resize(function () {
//   clearTimeout(resizeDelayTimer);
//   resizeDelayTimer = setTimeout(DimensionsUtils.resizeVis, 200);
// });

module.exports = DimensionsUtils;