var EditorUtils = require('./editor_module.js'),
    ColorUtils = require('./color_module.js'),
    TipUtils = require('./tooltip_module.js'),
    SelectionUtils = require('./selections_module.js');

var zoomScale = window.zoomScale;

function getBorderWidth (d) {
  //console.log("getBorderWidth: ", 1.5 / window.zoomScale);
  return 1.5 / window.zoomScale;
}

var CircleUtils = {

  setCircleID: function (d) {
    return 'n' + d.uniqueId;
  },

  getOpacity: function (d) {
    if (d.type === 'hidden' || d.name === 'root') {
      return 1e-6;
    } else if (d.type === 'file' || d.type === 'inlineScript') {
      return 1e-6;
    } else if (d.name === '[Anonymous]') {
      return 1;
    } else {
      return 0.4;
    }
  },

  getBorderWidth: getBorderWidth,

  highlightActiveNode: function (uniqueId) {
    var //vis = d3.select("svg.bubble-chart"),
        vis = SelectionUtils.getVis(),
        nodeData = vis.select('#n' + uniqueId);

    vis.append("svg:circle")
      .attr("cx", nodeData.attr("cx"))
      .attr("cy", nodeData.attr("cy"))
      .attr("r", nodeData.attr("r"))
      .attr("class", "highlighted")
      .transition()
        .duration(200)
        .attr("r", parseInt(nodeData.attr("r")) + 10)
      .transition()
        .delay(200)
        .duration(200)
        .attr("r", 0)
        .remove();
  },

  onCircleClick: function (d) {
    if (d3.event.defaultPrevented) {
      return;
    }
    //clean up old selection:
    d3.select(".selected").style("stroke", ColorUtils.getBorderColor)
      .classed("selected", false);

    //highlight new selection (clicked circle)
    d3.select(this).style("stroke", ColorUtils.selfBorderColor)
      .classed("selected", true);
    
    EditorUtils.setEditorContents(d);

    d3.event.stopPropagation();
  },

  highlightCircle: function (selectedCircle) {
    //var zoomScale = ZoomUtils.getZoomScale();

    d3.select(".selected").style("stroke", ColorUtils.getBorderColor)
      .classed("selected", false);

    d3.select(selectedCircle)
      .classed("selected", true)
      .style("opacity", 1)
      .style("stroke", "#000000")
      .transition()
        .duration(750)
        .style("stroke-width", (5 / zoomScale))
        .attr("r", function (d) {
          return d.r + 30 / zoomScale;
        })
      .transition()
        .delay(750)
        .style("stroke-width", this.getBorderWidth)
        .style("stroke", ColorUtils.selfBorderColor)
        .style("opacity", this.getOpacity)
        .attr("r", function (d) {
          return d.r;
        });
  },

  updateCirclesAfterZoom: function () {
    var circles = SelectionUtils.getCircles()
        .style("stroke-width", getBorderWidth);
  },

  positionCircles: function () {
    SelectionUtils.getCircles()
      .transition()
        .duration(750)
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.r; });
  },

  mouseOverCircle: function(d) {
    if (d.name !== 'root' && d.type !== 'hidden' && (d.name !== '[Anonymous]' || (d.name === '[Anonymous]' && d.parent && (d.parent.type === 'file' || d.parent.type === 'inlineScript') && d.parent.children && d.parent.children.length === 1))) {
      TipUtils.getToolTip().attr('class', 'd3-tip animate').show(d);
    }
  },

  mouseOutCircle: function (d) {
    var tip = TipUtils.getToolTip();

    tip.attr('class', 'd3-tip').show(d);
    tip.hide();
  }

};


module.exports = CircleUtils;