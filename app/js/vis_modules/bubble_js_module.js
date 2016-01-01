var TreeUtils = require('./tree_module.js'),
    DimensionsUtils = require('./dimensions_module.js'),
    ZoomUtils = require('./zoom_module.js'),
    EditorUtils = require('./editor_module.js'),
    TipUtils = require('./tooltip_module.js'),
    TextUtils = require('./text_module.js'),
    CircleUtils = require('./circle_module.js'),
    ColorUtils = require('./color_module.js'),
    //ExtensionUtils = require('./extension_module.js'),
    SelectionUtils = require('./selections_module.js');

var vis,
    pack,
    root;

var BubbleJS = {
  initVis: function () {
    // DimensionsUtils.setAllDimensions();
    var w = DimensionsUtils.getWidth(),
        h = DimensionsUtils.getHeight();
    // ZoomUtils.initZoom(w, h);
    // EditorUtils.initEditor(); //move outside
    // TipUtils.initToolTip();

    this.initPack();

    vis = d3.select("svg.bubble-chart")
      .attr("width", w)
      .attr("height", h)
      .attr("opacity", 1)
      .append("svg:g")
      .attr("class", "outter-g")
      .attr("transform", DimensionsUtils.transformToCenter)
      .call(ZoomUtils.getZoom())
      .append("svg:g")
      .attr("class", "inner-g");

    vis.call(TipUtils.getToolTip());
    $("svg.bubble-chart").css("opacity", 1);

    //ExtensionUtils.setPageTitle(); // move outside
  },

  //MOVED TO SELECTIONUTILS
  // getVis: function () {
  //   return vis;
  // },

  initPack: function () {
    var r = DimensionsUtils.getRadius();
    
    pack = d3.layout.pack()
      .sort(null)
      .size([r, r])
      .padding(2)
      .value(TreeUtils.getDataValue);
  },

  setPackNodes: function (rootNode) {
    return pack.nodes(rootNode);
  },

  getPack: function () {
    return pack;
  },

  setRoot: function (rootNode) {
    root = rootNode;
  },

  getRoot: function () {
    return root;
  },

  update: function (rootNode) {
    var nodes;

    rootNode ? this.setRoot(rootNode) : null;
    nodes = this.setPackNodes(root);
    
    updateCircles(nodes);
    updateLabels(nodes.filter(TextUtils.hasLabel));
    //removePaths(); // save for real time or dependencies
  },

  resizeVis: resizeVis

};

function updateCircles (nodes) {
  var circles = SelectionUtils.getCircles()
    .data(nodes, function (d) {
      return d.uniqueId;
    });

  circles.style("stroke", ColorUtils.getBorderColor);

  CircleUtils.positionCircles();
      
  circles.enter().append("svg:circle")
    .attr("id", CircleUtils.setCircleID)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.r; })
    .style("stroke", ColorUtils.getBorderColor)
    .style("fill", ColorUtils.getFillColor)
    .style("stroke-width", CircleUtils.getBorderWidth)
    .style("opacity", CircleUtils.getOpacity)
    .on("click", CircleUtils.onCircleClick)
    .on('mouseover', CircleUtils.mouseOverCircle)
    .on('mouseout', CircleUtils.mouseOutCircle);

  circles.exit()
    .transition()
      .duration(750)
      .attr("r", function(d) { return 1e-6; })
      .remove();

  circles.order();
}

function updateLabels (nodes) {
  var labels;

  labels = SelectionUtils.getLabels()
    .data(nodes, function (d) {
      return d.uniqueId;
    });
  
  labels.text(TextUtils.getLabelText)
    .transition()
      .duration(750)
      .style("opacity", TextUtils.getLabelOpacity)
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });
    
  labels
    .enter().append("svg:text")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("dy", TextUtils.getLabelVerticalOffset)
    .attr("text-anchor", "middle")
    .style("fill", '#000')
    .style("font-size", TextUtils.getFontSize)
    .style("opacity", 1e-6)
    .text(TextUtils.getLabelText)
    .transition()
      .duration(500)
      .style("opacity", TextUtils.getLabelOpacity); 

  labels.exit()
    .transition()
      .duration(500)
      .style("opacity", 1e-6)
      .remove();

  labels.order();
}

function resizeVis () {
  DimensionsUtils.setAllDimensions();
  var r = DimensionsUtils.getRadius();
  var w = DimensionsUtils.getWidth();
  var h = DimensionsUtils.getHeight();
  var zoom = ZoomUtils.getZoom();
  pack.size([r, r]);
  zoom.size([w, h]);
  $("svg.bubble-chart").height(h).width(w);
  $(".outter-g").attr("transform", DimensionsUtils.transformToCenter());
  SelectionUtils.getOutterG().call(zoom);
  BubbleJS.update();
}

module.exports = BubbleJS;