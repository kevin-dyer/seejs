
var vis;

var SelectionUtils = {
  getVis: function () {
    if (!vis){
      vis = d3.select("svg.bubble-chart .inner-g");
    }

    return vis;
  },

  getCircles: function () {
    return this.getVis().selectAll("circle");
  },

  getLabels: function () {
    return this.getVis().selectAll("text");
  },

  getOutterG: function () {
    return this.getVis().select(".outter-g");
  }
};

module.exports = SelectionUtils;