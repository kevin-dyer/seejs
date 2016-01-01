(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//window.zoomScale = 1;

var BubbleJS = require('./vis_modules/bubble_js_module.js'),
    ExtensionUtils = require('./vis_modules/extension_module.js'),
    DimensionsUtils = require('./vis_modules/dimensions_module.js'),
    ZoomUtils = require('./vis_modules/zoom_module.js'),
    EditorUtils = require('./vis_modules/editor_module.js'),
    TipUtils = require('./vis_modules/tooltip_module.js'),
    ReactUtils = require('./vis_modules/react_module.js');

var w, h, resizeDelayTimer;

ExtensionUtils.setPageTitle();
DimensionsUtils.setAllDimensions();
w = DimensionsUtils.getWidth();
h = DimensionsUtils.getHeight();
ZoomUtils.initZoom(w, h);
EditorUtils.initEditor();
TipUtils.initToolTip();

BubbleJS.initVis();

var root = ExtensionUtils.getCodeTree();
BubbleJS.update(root);

$(window).resize(function () {
    clearTimeout(resizeDelayTimer);
    resizeDelayTimer = setTimeout(BubbleJS.resizeVis, 200);
});
$(document).ready(function () {
    $('.show-code').click(EditorUtils.toggleCode);
    $(".close-editor-button").click(EditorUtils.hideCode);
    $(".webpage-title").click(ExtensionUtils.goToSourcePage);
    $('#show-react-bubbles').click(ReactUtils.bubbleVis);
});

//Try adding new visualization - react components

// (function (exports) {
//   var container = document.getElementsByClassName("page-content")[0],
//       // w = h = r = container.offsetWidth > container.offsetHeight ? container.offsetHeight : container.offsetWidth,
//       w = container.offsetWidth - 40,
//       h = container.offsetHeight - 40,
//       r = w > h ? h : w,
//       // x = d3.scale.linear().range([0, r]), //Are these necessary? remove?
//       // y = d3.scale.linear().range([0, r]),
//       root,
//       node,
//       nodes,

//       // fontScale = d3.scale.linear()
//       //       .domain([1, r])
//       //       .range([6, 18]),

//       editor = ace.edit("editor"),
//       currentEditorNode,
//       currentEditorLoc,

//       //brewer color solid color scale
//       // colorList = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)'],
//       // colorListLength = colorList.length, //9

//       //colors:
//       backgroundColor = "#FFF",
//       selfBorderColor = "#f33",
//       //depBorderColor = "black",
//       //defaultBorderColor = "#1C5787",
//       anonymousBorderColor = "#ffcf40",
//       //noDepBorderColor = "steelblue",
//       //fileBorderColor = colorList[8],

//       //defaultFillColor = "#1f77b4",
//       //selfFillColor = defaultFillColor,
//       //depFillColor = colorList[7],
//       //anonymousFillColor = backgroundColor,
//       //noDepFillColor = "#7D7D7D",
//       //noChildFillColor = "#ccc",
//       //fileFIllColor = colorList[1],
//       pathColor = "#FFFFFF",

//       fillColorList = d3.scale.category10().range(),
//       fillColorListLength = fillColorList.length;

//   function fillColor (domain) {
//     return fillColorList[domain % fillColorListLength];
//   };

//   // //init colorScale with index 0
//   // fillColor(0);

//   var pack = d3.layout.pack()
//         .sort(null)
//         .size([r, r])
//         .padding(2)
//         .value(function(d) {
//           if (d.range) {
//             return d.range[1] - d.range[0];
//           } else {
//             return 1;
//           }
//         });

//   var zoom = d3.behavior.zoom()
//     .translate([0, 0])
//     .center(null)
//     .scaleExtent([1, 50])
//     .size([w, h])
//     .on("zoom", zoomed)
//     .on("zoomstart", zoomStarted)
//     .on("zoomend", zoomEnded);

//   var vis = d3.select("svg.bubble-chart")
//         .attr("width", w)
//         .attr("height", h)
//         .attr("opacity", 1)
//         .append("svg:g")
//         .attr("class", "outter-g")
//         .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")")
//         .call(zoom)
//         .append("svg:g");

//   /* Initialize tooltip */
//   var tip = d3.tip().attr('class', 'd3-tip').html(getToolTipText);
//   vis.call(tip);

//   $("svg.bubble-chart").css("opacity", 1);

// //for editor
//   editor.resize(true);
//   editor.setAnimatedScroll(true);

//   $("#editor").click(function () {
//     var position = editor.getCursorPosition();
//     var cursorIndex = new ace.EditSession(editor.getValue()).getDocument().positionToIndex(position);

//     var selectedCircle = getNodeFromEditorPosition(cursorIndex);
//     highlightCircle(selectedCircle);
//   });

//   function getNodeFromEditorPosition (cursorIndex) {
//     var smallestNode = findSmallestWrappingNode(cursorIndex, currentEditorNode);

//     if (smallestNode) {
//       return $("#n" + smallestNode.uniqueId)[0];
//     }
//     console.log("smallestNode does NOT exist");
//   }

//   function findSmallestWrappingNode (cursorIndex, tmpNode) {
//     var tmpChildren = tmpNode.children,
//         tmpChild;

//     if (!tmpChildren || !tmpChildren.length) {
//       return tmpNode;
//     }

//     for(var i=0, l = tmpChildren.length; i < l; i++) {
//       tmpChild = tmpChildren[i];
//       if (insideNode(cursorIndex, tmpChild)) {
//         tmpNode = findSmallestWrappingNode(cursorIndex, tmpChild);
//         break;
//       }
//     }
//     return tmpNode;
//   }

//   //returns boolean if current position is inside node
//   function insideNode (cursorIndex, testNode) {
//     var treeNode = testNode.treeNode,
//         range = treeNode ? treeNode.range : null,
//         start,
//         end;

//     if (range) {
//       start = range[0];
//       end = range[1];
//       if (start <= cursorIndex && end >= cursorIndex) {
//         return true;
//       }
//     }

//     return false;
//   }

//   function highlightCircle (selectedCircle) {
//     var zoomScale = zoom.scale();

//     d3.select(".selected").style("stroke", getBorderColor)
//       .classed("selected", false);

//     d3.select(selectedCircle)
//       .classed("selected", true)
//       .style("opacity", 1)
//       .style("stroke", "#000000")
//       .transition()
//         .duration(750)
//         .style("stroke-width", (5 / zoomScale))
//         .attr("r", function (d) {
//           return d.r + 30 / zoomScale;
//         })
//       .transition()
//         .delay(750)
//         .style("stroke-width", getBorderWidth)
//         .style("stroke", selfBorderColor)
//         .style("opacity", getOpacity)
//         .attr("r", function (d) {
//           return d.r;
//         });
//   }

//   function update(rootNode) {
//     root = rootNode;
//     nodes = pack.nodes(rootNode);

//     var editor = ace.edit("editor");

//     updateCircles(nodes);
//     updateLabels(nodes.filter(hasLabel));
//     removePaths();

//   }

//   function updateCircles (nodes) {
//     var circles;

//     circles = vis.selectAll("circle")
//         .data(nodes, function (d) {
//           return d.uniqueId;
//         });

//     circles
//       .style("stroke", getBorderColor)
//       .transition()
//         .duration(750)
//         .attr("cx", function(d) {return d.x})
//         .attr("cy", function(d) { return d.y; })
//         .attr("r", function(d) { return d.r; });

//     circles.enter().append("svg:circle")
//       .attr("class", getClass)
//       .attr("id", function (d) {
//         return 'n' + d.uniqueId;
//       })
//       .attr("cx", function(d) { return d.x; })
//       .attr("cy", function(d) { return d.y; })
//       .attr("r", function(d) { return d.r; })
//       .style("stroke", getBorderColor)
//       .style("fill", getFillColor)
//       .style("stroke-width", getBorderWidth)
//       .style("opacity", getOpacity)
//       .on("click", onCircleClick)
//       .on('mouseover', function(d) {
//         if (d.name !== 'root' && d.type !== 'hidden' && (d.name !== '[Anonymous]' || (d.name === '[Anonymous]' && d.parent && (d.parent.type === 'file' || d.parent.type === 'inlineScript') && d.parent.children && d.parent.children.length === 1))) {
//           tip.attr('class', 'd3-tip animate').show(d);
//         }
//       })
//       .on('mouseout', function (d) {
//         tip.attr('class', 'd3-tip').show(d)
//         tip.hide();
//       });

//     circles.exit()
//       .transition()
//         .duration(750)
//         .attr("r", function(d) { return 1e-6; })
//         .remove();

//     circles.order();
//   }

//   function updateLabels (nodes) {
//     var labels;

//     labels = vis.selectAll("text").data(nodes, function (d) {
//         return d.uniqueId;
//       });

//     labels.attr("class", getClass)
//       .text(getLabelText)
//       .transition()
//         .duration(750)
//         .style("opacity", getLabelOpacity)
//         .attr("x", function(d) { return d.x; })
//       .attr("y", function(d) { return d.y; });

//     labels
//       .enter().append("svg:text")
//       .attr("class", getClass)
//       .attr("x", function(d) { return d.x; })
//       .attr("y", function(d) { return d.y; })
//       .attr("dy", getLabelVerticalOffset)
//       .attr("text-anchor", "middle")
//       .style("fill", '#000')
//       .style("font-size", getFontSize)
//       .style("opacity", 1e-6)
//       .text(getLabelText)
//       .transition()
//         .duration(500)
//         .style("opacity", getLabelOpacity);

//     labels.exit()
//       .transition()
//         .duration(500)
//         .style("opacity", 1e-6)
//         .remove();

//     labels.order();
//   }

//   function onCircleClick (d, i) {
//     if (d3.event.defaultPrevented) {
//       return;
//     }
//     //clean up old selection:
//     d3.select(".selected").style("stroke", getBorderColor)
//       .classed("selected", false);

//     //highlight new selection (clicked circle)
//     d3.select(this).style("stroke", selfBorderColor)
//       .classed("selected", true);

//     //TODO: add back in
//     //toggleDependencies(d, i);

//     setEditorContents(d);

//     d3.event.stopPropagation();
//   }

//   function hasLabel (d) {
//     return d.name !== '[Anonymous]' && d.name !== 'root';
//   }

//   function getLabelOpacity (d) {
//     if (d.r * zoom.scale() < 15) {
//       return 1e-6;
//     } else {
//       return 1;
//     }
//   }

//   function getLabelText (d) {
//     var text = getToolTipText(d),
//         letterWidth = getFontSize(d),
//         zoomScale = zoom.scale();

//     return text ? text.slice(0, parseInt(d.r * zoomScale / letterWidth * 2 + 2)) : '';
//   }

//   function getLabelVerticalOffset (d, zoomScale) {
//     zoomScale = zoom.scale();

//     if (d.type === 'file' || d.type === 'inlineScript') {
//       return -0.75 * d.r;
//     } else if (d.r * zoomScale > 20 && d.children && d.children.length < 3 && d.children.length) {
//       //hack to avoid most common label collisions
//       return -11 / zoomScale;
//     } else {
//       return 3 / zoomScale;
//     }
//   }

//   function zoomStarted () {
//   }

//   function zoomed () {
//     vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//   }

//   //var zoomScale;
//   var oldZoomScale = 1;

//   function zoomEnded (e) {
//     var zoomScale = zoom.scale();

//     if (zoomScale === oldZoomScale) {
//       d3.event && d3.event.sourceEvent ? d3.event.sourceEvent.preventDefault() : null;
//       return;
//     }

//     var circles = vis.selectAll("circle")
//           .style("stroke-width", getBorderWidth);

//     var labels = vis.selectAll("text")
//           .attr("dy", getLabelVerticalOffset);

//     labels.filter(function (d) {
//       return this.style.opacity === '1e-06';
//     }).style('font-size', getFontSize)
//       .text(getLabelText)
//       .transition()
//         .duration(500)
//         .style("opacity", getLabelOpacity);

//     labels.filter(function (d) {
//       return this.style.opacity !== '1e-06';
//     }).transition()
//         .duration(500)
//         .style("font-size", getFontSize)
//         .style("opacity", getLabelOpacity)
//       .transition().delay(500).text(getLabelText);

//     oldZoomScale = zoomScale;
//   }

//   function getFontSize (d) {
//     var zoomScale = zoom.scale(),
//         fontSize;

//     if (d.type === 'file' || d.type === 'inlineScript') {
//       fontSize = 20;
//     } else if (d.children && d.children.length) {
//       fontSize = 12;
//     } else {
//       fontSize = 11;
//     }

//     return fontSize / zoomScale;
//   }

//   function removePaths () {
//     var paths = vis.selectAll(".link").transition().remove();
//   }

//   function toggleDependencies (d, i) {
//     showDependencyPaths(d);
//     updateDependencyText(d, i);
//   }

//   function showDependencyPaths (d) {
//     var links = [],
//         paths;

//     if (!d.dependencies || d.dependencies.length === 0) {
//       return;
//     }

//     links = d.dependencies.map(function(dep) {
//       return {
//         "source": d,
//         "target": dep
//       };
//     });

//     paths = vis.selectAll(".link")
//         .data(links);

//     paths.enter().append("svg:path")
//       .attr("class", "link")
//       .style("stroke", pathColor)
//       .style("fill", pathColor)
//       .style("stroke-width", function (d) {
//         return d3.min([d.source.r * 2, d.target.r * 2, 25]);
//       })
//       .style("stroke-linecap", "round")
//       .attr("opacity", 0.9)
//       .attr("d", lineData);

//     paths.each(function(d) { d.totalLength = this.getTotalLength(); d.highlight = true;})
//       .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
//       .attr("stroke-dashoffset", function(d) { return d.totalLength; })
//       .transition()
//         .duration(1000)
//         .attr("stroke-dashoffset", function(d) { return -1 * d.totalLength; })
//         .remove();

//     paths.exit().transition().remove();
//   }

//   function updateDependencyText (d, i) {
//     var labels = vis.selectAll("text"),
//         thisD = d,
//         thisI = i;

//     labels.style("fill", function (d) {
//       return getTextFill(d, thisD);
//     });
//   }

//   //TODO: move to editor module
//   // set currentEditorNode and currentEditorLoc in the module
//   function setEditorContents (d) {
//     var parent,
//         range,
//         code;

//     if (d.treeNode) {
//           range = d.treeNode.range;

//       parent = getParentFile(d);

//       if (!currentEditorNode || parent.uniqueId !== currentEditorNode.uniquId) {
//         editor.setValue(parent.sourceCode);
//         currentEditorNode = parent;
//       }
//       currentEditorLoc = d.treeNode && d.treeNode.loc ? d.treeNode.loc.start : {line:0, column: 0};

//       if (showEditor) {
//         positionEditor();
//       }
//     }
//   }

//   function positionEditor () {
//     if (currentEditorLoc) {
//       editor.resize(true);
//       editor.gotoLine(currentEditorLoc.line, currentEditorLoc.column, true);
//     }
//   }

//   //TODO: move to path_module.js
//   function lineData(d){
//     var line = d3.svg.line()
//           .x( function(point) { return point.lx; })
//           .y( function(point) { return point.ly; }),
//         points = [
//           {lx: d.source.x, ly: d.source.y},
//           {lx: d.target.x, ly: d.target.y}
//         ];

//     return line(points);
//   }

//   function makeBubbleChart (root)  {
//     console.log("root: ", root);
//     update(root);
//   }

//   //this is where i hide the files and anonymous circles
//   // TODO: should hide them by making them opac, with a background color fill color and a golden border color
//   function getBorderColor (d, i, thisD) {
//     if (d.name === '[Anonymous]' && d.parent.type === 'file') {
//       return anonymousBorderColor;
//     } else if (d.name === '[Anonymous]') {
//       return anonymousBorderColor;
//     } else if (d.name  === 'root') {
//       return backgroundColor;
//     } else if (d.type === 'file' || d.type === 'inlineScript') {
//       return backgroundColor;
//     } else if (d.type ==='hidden') {
//       return backgroundColor;
//     }else {
//       return getFillColor(d);
//     }
//   }

//   function getFillColor (d, i, thisD) {
//     var parentFile,
//         sourceIndex,
//         fileFillColor;

//     //ROOT
//     if (!d.parent || d.parent === null) {
//       return backgroundColor;
//     }

//     //FILES
//     if (d.type === 'file') {
//       return backgroundColor;
//     }

//     //HIDDEN
//     if (d.type === 'hidden') {
//       return backgroundColor;
//     }

//     //ANONY
//     if (d.name === '[Anonymous]') {
//       return backgroundColor;
//     }

//     parentFile = getParentFile(d);

//     sourceIndex = parentFile.sourceIndex;

//     fileFillColor = fillColor(sourceIndex);

//     return parentFile ? fileFillColor : backgroundColor;
//   }

//   //TODO: move to TreeUtils
//   function getParentFile (d) {
//     var temp = d;
//     while(temp.parent) {
//       //TODO: handle inlineScripts differently
//       if (temp.type === 'file' || temp.type === 'inlineScript') {
//         return temp;
//       }
//       temp = temp.parent;
//     }
//     return null;
//   }

//   function getOpacity(d, thisD) {
//     if (d.type === 'hidden' || d.name === 'root') {
//       return 1e-6;
//     } else if (d.type === 'file' || d.type === 'inlineScript') {
//       return 1e-6;
//     } else if (d.name === '[Anonymous]') {
//       return 1;
//     } else {
//       return 0.4;
//     }
//   }

//   function getBorderWidth(d) {
//     var zoomScale = zoom.scale();

//     return 1.5 / zoomScale;
//   }

//   // TODO: move to textUtils
//   function getToolTipText (d) {
//     if (d.type === 'file') {
//       return getBaseFileName(d.name);
//     } else if (d.name === '[Anonymous]') { //assuming parent is script and only has 1 child
//       return d.parent.name;
//     } else {
//       return d.name;
//     }
//   }

//   function getBaseFileName (name) {
//     var nameSplit = name.split('/');

//     return removeFileNameCash(nameSplit[(nameSplit.length - 1)]);
//   }

//   function removeFileNameCash (name) {
//     var cashSplit = name.split('?');

//     if (cashSplit.length > 1) {
//       cashSplit.pop();
//     }

//     return cashSplit.join('');
//   }

//   //TODO: unnecessary, remove all invocations
//   function getClass (d) {
//     var myClass;
//     myClass = d.children && d.children.length ? "parent" : "child";
//     // if (d.uniqueId) {
//     //   myClass += ' n' + d.uniqueId;
//     // }
//     return myClass;
//   }

//   function highlightActiveNode(uniqueId) {
//     var nodeData = vis.select('#n' + uniqueId);

//     vis.append("svg:circle")
//       .attr("cx", nodeData.attr("cx"))
//       .attr("cy", nodeData.attr("cy"))
//       .attr("r", nodeData.attr("r"))
//       .attr("class", "highlighted")
//       .transition()
//         .duration(200)
//         .attr("r", parseInt(nodeData.attr("r")) + 10)
//       .transition()
//         .delay(200)
//         .duration(200)
//         .attr("r", 0)
//         .remove();
//   }

//   //TODO: move to vis_module
//   function resizeVis() {
//     container = document.getElementsByClassName("page-content")[0];
//     w = container.offsetWidth - 40;
//     h = container.offsetHeight - 40;
//     r = w > h ? h : w;
//     // x = d3.scale.linear().range([0, r]);
//     // y = d3.scale.linear().range([0, r]);

//     pack.size([r, r]);
//     zoom.size([w, h]);

//     $("svg.bubble-chart").height(h).width(w);
//     $(".outter-g").attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

//     vis.select("outter-g").call(zoom);
//     update(root);
//   }

//   window.bubble = {
//     makeBubbleChart: makeBubbleChart,
//     updateBubbleChart: update,
//     getBorderWidth: getBorderWidth,
//     highlightActiveNode: highlightActiveNode,
//     resizeVis: resizeVis,
//     editor: editor,
//     positionEditor: positionEditor
//   }
// })(window);

// //JUST A TEST:::
// var background = chrome.extension.getBackgroundPage(),
//     pageTitle = document.getElementsByClassName('webpage-title')[0],
//     startTraceButton = document.getElementById('start-tracer'),
//     stopTraceButton = document.getElementById('stop-tracer');

// bubble.makeBubbleChart(background.codeTree);

// pageTitle.innerHTML = background.sourcePageUrl;

// startTraceButton.addEventListener("click", listenToTrace);
// stopTraceButton.addEventListener("click", stopListeningToTrace);

// function listenToTrace () {
//   console.log("adding trace listener");

//   chrome.runtime.onConnect.addListener(receiveFilterTrace);
//   //background.initTrace();

//   startTraceButton.style.display = 'none';
//   stopTraceButton.style.display = 'inline-block';
// }

// function stopListeningToTrace () {
//   console.log("stopping trace listener");

//   //chrome.runtime.onConnect.removeListener(receiveFilterTrace);
//   //also need to stop background listener
//   //chrome.runtime.onMessage.removeListener(receiveFilterTrace);
//   chrome.runtime.reload();

//   //startTraceButton.style.display = 'inline-block';
//   //stopTraceButton.style.display = 'none';
// }

// function receiveFilterTrace (port) {
//   if (port.name === 'filteredTrace') {
//     port.onMessage.addListener(function(msg) {
//       if (msg.type === 'trace2') {
//         //console.log("TRACE2: ", msg);
//         bubble.highlightActiveNode(msg.data.uniqueId);
//       }
//     })
//   }
// }

// function goToSourcePage() {
//   var tabId = background.sourcePageTab;
//   console.log("goToSourcePage: ", tabId);
//   if (tabId) {
//     chrome.tabs.update(tabId, {"selected": true});
//   }
// }

// var showEditor = false;

// function showCode () {
//   $('#side-bar').fadeIn().height($('.bubble-chart').height());
//   showEditor = true;
//   bubble.positionEditor();
// }

// function hideCode () {
//   $("#side-bar").fadeOut();
//   showEditor = false;
// }

// function toggleCode () {
//   if (showEditor) {
//     hideCode();
//   } else {
//     showCode();
//   }
// }

// $(document).ready(function () {
//   $('.show-code').click(toggleCode);

//   $(".close-editor-button").click(hideCode);
//   $(".webpage-title").click(goToSourcePage);

//   $( ".editor-wrapper" ).resizable({
//       handles: 's, w, sw',
//       // maxHeight: 1000,
//       // maxWidth: 1000,
//       minHeight: 100,
//       minWidth: 200,
//       stop: function (e) {
//         window.bubble.editor.resize();
//         console.log("called editor.resize()");
//       }
//     });
// });

// var resizeDelayTimer;

// $(window).resize(function () {
//   clearTimeout(resizeDelayTimer);
//   resizeDelayTimer = setTimeout(bubble.resizeVis, 200);
// });

},{"./vis_modules/bubble_js_module.js":2,"./vis_modules/dimensions_module.js":5,"./vis_modules/editor_module.js":6,"./vis_modules/extension_module.js":7,"./vis_modules/react_module.js":8,"./vis_modules/tooltip_module.js":11,"./vis_modules/zoom_module.js":13}],2:[function(require,module,exports){
'use strict';

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

var vis, pack, root;

var BubbleJS = {
  initVis: function initVis() {
    // DimensionsUtils.setAllDimensions();
    var w = DimensionsUtils.getWidth(),
        h = DimensionsUtils.getHeight();
    // ZoomUtils.initZoom(w, h);
    // EditorUtils.initEditor(); //move outside
    // TipUtils.initToolTip();

    this.initPack();

    vis = d3.select("svg.bubble-chart").attr("width", w).attr("height", h).attr("opacity", 1).append("svg:g").attr("class", "outter-g").attr("transform", DimensionsUtils.transformToCenter).call(ZoomUtils.getZoom()).append("svg:g").attr("class", "inner-g");

    vis.call(TipUtils.getToolTip());
    $("svg.bubble-chart").css("opacity", 1);

    //ExtensionUtils.setPageTitle(); // move outside
  },

  //MOVED TO SELECTIONUTILS
  // getVis: function () {
  //   return vis;
  // },

  initPack: function initPack() {
    var r = DimensionsUtils.getRadius();

    pack = d3.layout.pack().sort(null).size([r, r]).padding(2).value(TreeUtils.getDataValue);
  },

  setPackNodes: function setPackNodes(rootNode) {
    return pack.nodes(rootNode);
  },

  getPack: function getPack() {
    return pack;
  },

  setRoot: function setRoot(rootNode) {
    root = rootNode;
  },

  getRoot: function getRoot() {
    return root;
  },

  update: function update(rootNode) {
    var nodes;

    rootNode ? this.setRoot(rootNode) : null;
    nodes = this.setPackNodes(root);

    updateCircles(nodes);
    updateLabels(nodes.filter(TextUtils.hasLabel));
    //removePaths(); // save for real time or dependencies
  },

  resizeVis: resizeVis

};

function updateCircles(nodes) {
  var circles = SelectionUtils.getCircles().data(nodes, function (d) {
    return d.uniqueId;
  });

  circles.style("stroke", ColorUtils.getBorderColor);

  CircleUtils.positionCircles();

  circles.enter().append("svg:circle").attr("id", CircleUtils.setCircleID).attr("cx", function (d) {
    return d.x;
  }).attr("cy", function (d) {
    return d.y;
  }).attr("r", function (d) {
    return d.r;
  }).style("stroke", ColorUtils.getBorderColor).style("fill", ColorUtils.getFillColor).style("stroke-width", CircleUtils.getBorderWidth).style("opacity", CircleUtils.getOpacity).on("click", CircleUtils.onCircleClick).on('mouseover', CircleUtils.mouseOverCircle).on('mouseout', CircleUtils.mouseOutCircle);

  circles.exit().transition().duration(750).attr("r", function (d) {
    return 1e-6;
  }).remove();

  circles.order();
}

function updateLabels(nodes) {
  var labels;

  labels = SelectionUtils.getLabels().data(nodes, function (d) {
    return d.uniqueId;
  });

  labels.text(TextUtils.getLabelText).transition().duration(750).style("opacity", TextUtils.getLabelOpacity).attr("x", function (d) {
    return d.x;
  }).attr("y", function (d) {
    return d.y;
  });

  labels.enter().append("svg:text").attr("x", function (d) {
    return d.x;
  }).attr("y", function (d) {
    return d.y;
  }).attr("dy", TextUtils.getLabelVerticalOffset).attr("text-anchor", "middle").style("fill", '#000').style("font-size", TextUtils.getFontSize).style("opacity", 1e-6).text(TextUtils.getLabelText).transition().duration(500).style("opacity", TextUtils.getLabelOpacity);

  labels.exit().transition().duration(500).style("opacity", 1e-6).remove();

  labels.order();
}

function resizeVis() {
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

},{"./circle_module.js":3,"./color_module.js":4,"./dimensions_module.js":5,"./editor_module.js":6,"./selections_module.js":9,"./text_module.js":10,"./tooltip_module.js":11,"./tree_module.js":12,"./zoom_module.js":13}],3:[function(require,module,exports){
'use strict';

var EditorUtils = require('./editor_module.js'),
    ColorUtils = require('./color_module.js'),
    TipUtils = require('./tooltip_module.js'),
    SelectionUtils = require('./selections_module.js');

var zoomScale = window.zoomScale;

function getBorderWidth(d) {
  //console.log("getBorderWidth: ", 1.5 / window.zoomScale);
  return 1.5 / window.zoomScale;
}

var CircleUtils = {

  setCircleID: function setCircleID(d) {
    return 'n' + d.uniqueId;
  },

  getOpacity: function getOpacity(d) {
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

  highlightActiveNode: function highlightActiveNode(uniqueId) {
    var //vis = d3.select("svg.bubble-chart"),
    vis = SelectionUtils.getVis(),
        nodeData = vis.select('#n' + uniqueId);

    vis.append("svg:circle").attr("cx", nodeData.attr("cx")).attr("cy", nodeData.attr("cy")).attr("r", nodeData.attr("r")).attr("class", "highlighted").transition().duration(200).attr("r", parseInt(nodeData.attr("r")) + 10).transition().delay(200).duration(200).attr("r", 0).remove();
  },

  onCircleClick: function onCircleClick(d) {
    if (d3.event.defaultPrevented) {
      return;
    }
    //clean up old selection:
    d3.select(".selected").style("stroke", ColorUtils.getBorderColor).classed("selected", false);

    //highlight new selection (clicked circle)
    d3.select(this).style("stroke", ColorUtils.selfBorderColor).classed("selected", true);

    EditorUtils.setEditorContents(d);

    d3.event.stopPropagation();
  },

  highlightCircle: function highlightCircle(selectedCircle) {
    //var zoomScale = ZoomUtils.getZoomScale();

    d3.select(".selected").style("stroke", ColorUtils.getBorderColor).classed("selected", false);

    d3.select(selectedCircle).classed("selected", true).style("opacity", 1).style("stroke", "#000000").transition().duration(750).style("stroke-width", 5 / zoomScale).attr("r", function (d) {
      return d.r + 30 / zoomScale;
    }).transition().delay(750).style("stroke-width", this.getBorderWidth).style("stroke", ColorUtils.selfBorderColor).style("opacity", this.getOpacity).attr("r", function (d) {
      return d.r;
    });
  },

  updateCirclesAfterZoom: function updateCirclesAfterZoom() {
    var circles = SelectionUtils.getCircles().style("stroke-width", getBorderWidth);
  },

  positionCircles: function positionCircles() {
    SelectionUtils.getCircles().transition().duration(750).attr("cx", function (d) {
      return d.x;
    }).attr("cy", function (d) {
      return d.y;
    }).attr("r", function (d) {
      return d.r;
    });
  },

  mouseOverCircle: function mouseOverCircle(d) {
    if (d.name !== 'root' && d.type !== 'hidden' && (d.name !== '[Anonymous]' || d.name === '[Anonymous]' && d.parent && (d.parent.type === 'file' || d.parent.type === 'inlineScript') && d.parent.children && d.parent.children.length === 1)) {
      TipUtils.getToolTip().attr('class', 'd3-tip animate').show(d);
    }
  },

  mouseOutCircle: function mouseOutCircle(d) {
    var tip = TipUtils.getToolTip();

    tip.attr('class', 'd3-tip').show(d);
    tip.hide();
  }

};

module.exports = CircleUtils;

},{"./color_module.js":4,"./editor_module.js":6,"./selections_module.js":9,"./tooltip_module.js":11}],4:[function(require,module,exports){
"use strict";

var TreeUtils = require('./tree_module.js');

var fillColorList = d3.scale.category10().range(),
    fillColorListLength = fillColorList.length,
    backgroundColor = "#FFF",
    selfBorderColor = "#f33",
    anonymousBorderColor = "#ffcf40";

function getFillColor(d) {
  var parentFile, sourceIndex, fileFillColor;

  if (!d.parent || d.parent === null) {
    return backgroundColor;
  } else if (d.type === 'file') {
    return backgroundColor;
  } else if (d.type === 'hidden') {
    return backgroundColor;
  } else if (d.name === '[Anonymous]') {
    return backgroundColor;
  }

  parentFile = TreeUtils.getParentFile(d);
  sourceIndex = parentFile.sourceIndex;

  fileFillColor = ColorUtils.fillColor(sourceIndex);

  return parentFile ? fileFillColor : backgroundColor;
}

var ColorUtils = {
  fillColorList: fillColorList, // TODO: may be able to remove
  backgroundColor: backgroundColor,
  selfBorderColor: selfBorderColor,
  anonymousBorderColor: anonymousBorderColor,

  fillColor: function fillColor(domain) {
    return fillColorList[domain % fillColorListLength];
  },

  getBorderColor: function getBorderColor(d) {
    if (d.name === '[Anonymous]') {
      return anonymousBorderColor;
    } else if (d.name === 'root') {
      return backgroundColor;
    } else if (d.type === 'file' || d.type === 'inlineScript') {
      return backgroundColor;
    } else if (d.type === 'hidden') {
      return backgroundColor;
    } else {
      return getFillColor(d);
    }
  },

  getFillColor: getFillColor
};

module.exports = ColorUtils;

},{"./tree_module.js":12}],5:[function(require,module,exports){
'use strict';

var BubbleJS = require('./bubble_js_module.js'),
    ZoomUtils = require('./zoom_module.js'),
    SelectionUtils = require('./selections_module.js');

var container, w, h, r, resizeDelayTimer;

function getContainer() {
  if (!container) {
    container = document.getElementsByClassName("page-content")[0];
  }
  return container;
}

function setWidth() {
  w = getContainer().offsetWidth - 40;
}

function getWidth() {
  return w;
}

function setHeight() {
  h = getContainer().offsetHeight - 40;
}

function getHeight() {
  return h;
}

function setRadius() {
  r = w > h ? h : w;
}

function getRadius() {
  return r;
}

function setAllDimensions() {
  setWidth();
  setHeight();
  setRadius();
}

function transformToCenter() {
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

},{"./bubble_js_module.js":2,"./selections_module.js":9,"./zoom_module.js":13}],6:[function(require,module,exports){
'use strict';

var CircleUtils = require('./circle_module.js'),
    TreeUtils = require('./tree_module.js');

var editor = ace.edit("editor"),
    //TODO: need to require ace module
currentEditorNode,
    currentEditorLoc,
    showEditor = false;

//TODO: create initializer for editor, make resize method, and setAnimated scroll method (or just put that one in the init function)

var EditorUtils = {
  initEditor: function initEditor() {
    editor = ace.edit("editor");
    editor.resize(true);
    editor.setAnimatedScroll(true);
    initEditorClickListener();
    initResizableEditorWrapper();
  },

  setEditorContents: function setEditorContents(d) {
    var parent, range, code;

    if (d.treeNode) {
      range = d.treeNode.range;

      parent = TreeUtils.getParentFile(d);

      if (!currentEditorNode || parent.uniqueId !== currentEditorNode.uniquId) {
        editor.setValue(parent.sourceCode);
        currentEditorNode = parent;
      }
      currentEditorLoc = d.treeNode && d.treeNode.loc ? d.treeNode.loc.start : { line: 0, column: 0 };

      if (showEditor) {
        positionEditor();
      }
    }
  },

  positionEditor: positionEditor,

  getCurrentEditorNode: function getCurrentEditorNode() {
    return currentEditorNode;
  },

  setCurrentEditorNode: function setCurrentEditorNode(d) {
    currentEditorNode = d;
  },

  getCurrentEditorLoc: function getCurrentEditorLoc() {
    return currentEditorLoc;
  },

  setCurrentEditorLoc: function setCurrentEditorLoc(d) {
    currentEditorLoc = d;
  },

  showCode: showCode,

  hideCode: hideCode,

  toggleCode: toggleCode

};

function positionEditor() {
  if (currentEditorLoc) {
    editor.resize(true);
    editor.gotoLine(currentEditorLoc.line, currentEditorLoc.column, true);
  }
}

function showCode() {
  $('#side-bar').fadeIn().height($('.bubble-chart').height());
  positionEditor();
  showEditor = true;
}

function hideCode() {
  $("#side-bar").fadeOut();
  showEditor = false;
}

function toggleCode() {
  if (showEditor) {
    hideCode();
  } else {
    showCode();
  }
}

//private methods
function initEditorClickListener() {
  $("#editor").click(function () {
    var position = editor.getCursorPosition();

    //TODO: move Edit Session into init method...
    var cursorIndex = getCursorIndex();

    var selectedCircle = getNodeFromEditorPosition(cursorIndex);
    CircleUtils.highlightCircle(selectedCircle);
  });
}

//TODO: can I create this new EditSession once and just update the value?
function getCursorIndex() {
  return new ace.EditSession(editor.getValue()).getDocument().positionToIndex(position);
}

function getNodeFromEditorPosition(cursorIndex) {
  var smallestNode = findSmallestWrappingNode(cursorIndex, currentEditorNode);

  if (smallestNode) {
    return $("#n" + smallestNode.uniqueId)[0];
  }
  console.log("smallestNode does NOT exist");
}

function findSmallestWrappingNode(cursorIndex, tmpNode) {
  var tmpChildren = tmpNode.children,
      tmpChild;

  if (!tmpChildren || !tmpChildren.length) {
    return tmpNode;
  }

  for (var i = 0, l = tmpChildren.length; i < l; i++) {
    tmpChild = tmpChildren[i];
    if (insideNode(cursorIndex, tmpChild)) {
      tmpNode = findSmallestWrappingNode(cursorIndex, tmpChild);
      break;
    }
  }
  return tmpNode;
}

//returns boolean if current position is inside node
function insideNode(cursorIndex, testNode) {
  var treeNode = testNode.treeNode,
      range = treeNode ? treeNode.range : null,
      start,
      end;

  if (range) {
    start = range[0];
    end = range[1];
    if (start <= cursorIndex && end >= cursorIndex) {
      return true;
    }
  }

  return false;
}

// function initEditorNavigation () {
//   $('.show-code').click(EditorUtils.toggleCode);
//   $(".close-editor-button").click(EditorUtils.hideCode);
// }

function initResizableEditorWrapper() {
  $(".editor-wrapper").resizable({
    handles: 's, w, sw',
    minHeight: 100,
    minWidth: 200,
    stop: function stop(e) {
      editor.resize();
      console.log("called editor.resize()");
    }
  });
}

module.exports = EditorUtils;

},{"./circle_module.js":3,"./tree_module.js":12}],7:[function(require,module,exports){
"use strict";

var backgroundPage;

console.log("ExtensionUtils loaded...");

var ExtensionUtils = {
  getBackgroundPage: function getBackgroundPage() {
    if (!backgroundPage) {
      backgroundPage = chrome.extension.getBackgroundPage();
    }
    return backgroundPage;
  },

  getPageTitleElement: function getPageTitleElement() {
    return document.getElementsByClassName('webpage-title')[0];
  },

  setPageTitle: function setPageTitle() {
    this.getPageTitleElement().innerHTML = this.getBackgroundPage().sourcePageUrl;
  },

  getCodeTree: function getCodeTree() {
    return this.getBackgroundPage().codeTree;
  },

  goToSourcePage: function goToSourcePage() {
    var tabId = this.getBackgroundPage().sourcePageTab;
    console.log("goToSourcePage: ", tabId);
    if (chrome.tabs.get(tabId)) {
      chrome.tabs.update(tabId, { "selected": true });
    } else {
      console.log("Source Page Tab does not exist anymore.");
    }
  },

  getReactComponentRoot: function getReactComponentRoot() {
    return this.getBackgroundPage().getReactComponents();
  }
};

module.exports = ExtensionUtils;

},{}],8:[function(require,module,exports){
'use strict';

var BubbleJS = require('./bubble_js_module.js'),
    ExtensionUtils = require('./extension_module.js');

var ReactUtils = {
  bubbleVis: function bubbleVis() {
    var root = ExtensionUtils.getReactComponentRoot();
    //var root = chrome.

    console.log("React Components Root: ", root);
    //BubbleJS.update(root);
  }
};

module.exports = ReactUtils;

},{"./bubble_js_module.js":2,"./extension_module.js":7}],9:[function(require,module,exports){
"use strict";

var vis;

var SelectionUtils = {
  getVis: function getVis() {
    if (!vis) {
      vis = d3.select("svg.bubble-chart .inner-g");
    }

    return vis;
  },

  getCircles: function getCircles() {
    return this.getVis().selectAll("circle");
  },

  getLabels: function getLabels() {
    return this.getVis().selectAll("text");
  },

  getOutterG: function getOutterG() {
    return this.getVis().select(".outter-g");
  }
};

module.exports = SelectionUtils;

},{}],10:[function(require,module,exports){
'use strict';

var SelectionUtils = require('./selections_module.js');

var zoomScale = window.zoomScale;

function getToolTipText(d) {
  if (d.type === 'file') {
    return getBaseFileName(d.name);
  } else if (d.name === '[Anonymous]') {
    //assuming parent is script and only has 1 child
    return d.parent.name;
  } else {
    return d.name;
  }
}

function getBaseFileName(name) {
  var nameSplit = name.split('/');

  return removeFileNameCash(nameSplit[nameSplit.length - 1]);
}

function removeFileNameCash(name) {
  var cashSplit = name.split('?');

  if (cashSplit.length > 1) {
    cashSplit.pop();
  }

  return cashSplit.join('');
}

function hasLabel(d) {
  return d.name !== '[Anonymous]' && d.name !== 'root';
}

function isHidden() {
  return this.style.opacity === '1e-06';
}

function isVisible() {
  return !isHidden();
}

function getLabelOpacity(d) {
  if (d.r * zoomScale < 15) {
    return 1e-6;
  } else {
    return 1;
  }
}

function getLabelText(d) {
  var text = getToolTipText(d),
      letterWidth = getFontSize(d);

  return text ? text.slice(0, parseInt(d.r * zoomScale / letterWidth * 2 + 2)) : '';
}

function getFontSize(d) {
  var fontSize;

  if (d.type === 'file' || d.type === 'inlineScript') {
    fontSize = 20;
  } else if (d.children && d.children.length) {
    fontSize = 12;
  } else {
    fontSize = 11;
  }

  return fontSize / zoomScale;
}

function getLabelVerticalOffset(d) {
  if (d.type === 'file' || d.type === 'inlineScript') {
    return -0.75 * d.r;
  } else if (d.r * zoomScale > 20 && d.children && d.children.length < 3 && d.children.length) {
    //hack to avoid most common label collisions
    return -11 / zoomScale;
  } else {
    return 3 / zoomScale;
  }
}

function updateLabelsAfterZoom() {
  var labels = SelectionUtils.getLabels();

  labels.attr("dy", getLabelVerticalOffset);
  labels.filter(function (d) {
    isHidden.bind(this);
  }).style('font-size', getFontSize).text(getLabelText).transition().duration(500).style("opacity", getLabelOpacity);

  labels.filter(function (d) {
    isVisible.bind(this);
  }).transition().duration(500).style("font-size", getFontSize).style("opacity", getLabelOpacity).transition().delay(500).text(getLabelText);
}

var TextUtils = {
  getToolTipText: getToolTipText,
  getBaseFileName: getBaseFileName,
  removeFileNameCash: removeFileNameCash,
  hasLabel: hasLabel,
  isHidden: isHidden, //NOTE: 'this' refers to the selected circle, not to TextUtils
  isVisible: isVisible,
  getLabelOpacity: getLabelOpacity,
  getLabelText: getLabelText,
  getFontSize: getFontSize,
  getLabelVerticalOffset: getLabelVerticalOffset,
  updateLabelsAfterZoom: updateLabelsAfterZoom
};

module.exports = TextUtils;

},{"./selections_module.js":9}],11:[function(require,module,exports){
'use strict';

var TextUtils = require('./text_module.js');

var tip;

var TipUtils = {

  initToolTip: function initToolTip() {
    tip = d3.tip().attr('class', 'd3-tip').html(TextUtils.getToolTipText);
  },

  getToolTip: function getToolTip() {
    return tip;
  }
};

module.exports = TipUtils;

},{"./text_module.js":10}],12:[function(require,module,exports){
'use strict';

var TreeUtils = {
  getParentFile: function getParentFile(d) {
    var temp = d;
    while (temp.parent) {
      //TODO: handle inlineScripts differently
      if (temp.type === 'file' || temp.type === 'inlineScript') {
        return temp;
      }
      temp = temp.parent;
    }
    return null;
  },

  getDataValue: function getDataValue(d) {
    if (d.range) {
      return d.range[1] - d.range[0];
    } else {
      return 1;
    }
  }
};

module.exports = TreeUtils;

},{}],13:[function(require,module,exports){
'use strict';

window.zoomScale = 1;

var CircleUtils = require('./circle_module.js'),
    TextUtils = require('./text_module.js'),
    SelectionUtils = require('./selections_module.js');

var zoom,
    oldZoomScale = 1;

var ZoomUtils = {

  initZoom: function initZoom(w, h) {
    zoom = d3.behavior.zoom().translate([0, 0]).center(null).scaleExtent([1, 50]).size([w, h]).on("zoom", zoomed).on("zoomstart", zoomStarted).on("zoomend", zoomEnded);

    setGlobalZoomScale(zoom.scale());
  },

  getZoom: function getZoom() {
    return zoom;
  },

  getZoomScale: function getZoomScale() {
    return zoom.scale();
  }
};

function zoomStarted() {}

function zoomed() {
  SelectionUtils.getVis().attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function zoomEnded(e) {
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

function setGlobalZoomScale(scale) {
  console.log("setting setGlobalZoomScale: ", scale);
  window.zoomScale = scale;
}

module.exports = ZoomUtils;

},{"./circle_module.js":3,"./selections_module.js":9,"./text_module.js":10}]},{},[1])
//# sourceMappingURL=bubble_bundle.js.map
