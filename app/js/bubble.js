(function (exports) {
  var container = document.getElementsByClassName("page-content")[0],
      // w = h = r = container.offsetWidth > container.offsetHeight ? container.offsetHeight : container.offsetWidth,
      w = container.offsetWidth - 40,
      h = container.offsetHeight - 40,
      r = w > h ? h : w,
      x = d3.scale.linear().range([0, r]),
      y = d3.scale.linear().range([0, r]),
      root,
      node,
      nodes,

      fontScale = d3.scale.linear()
            .domain([1, r])
            .range([6, 18]),

      editor = ace.edit("editor"),
      currentEditorNode,

      //brewer color solid color scale
      colorList = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)'],
      colorListLength = colorList.length, //9

      //colors:
      backgroundColor = "#FFF",
      selfBorderColor = "#f33",
      depBorderColor = "black",
      defaultBorderColor = "#1C5787",
      anonymousBorderColor = "#ffcf40",
      noDepBorderColor = "steelblue",
      fileBorderColor = colorList[8],

      defaultFillColor = "#1f77b4",
      selfFillColor = defaultFillColor,
      depFillColor = colorList[7],
      anonymousFillColor = backgroundColor,
      noDepFillColor = "#7D7D7D",
      noChildFillColor = "#ccc",
      fileFIllColor = colorList[1],
      pathColor = "#FFFFFF",

      fillColorList = d3.scale.category10().range(),
      fillColorListLength = fillColorList.length;

  function fillColor (domain) {
    return fillColorList[domain % fillColorListLength];
  };

  // //init colorScale with index 0
  // fillColor(0);

  var pack = d3.layout.pack()
        .sort(null)
        .size([r, r])
        .padding(2)
        .value(function(d) { 
          if (d.range) {
            return d.range[1] - d.range[0];
          } else {
            return 1;
          }
        });

  var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .center(null)
    .scaleExtent([1, 50])
    .size([w, h])
    .on("zoom", zoomed)
    .on("zoomstart", zoomStarted)
    .on("zoomend", zoomEnded);

  var vis = d3.select("svg.bubble-chart")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("class", "outter-g")
        .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")")
        .call(zoom)
        .append("svg:g");

  /* Initialize tooltip */
  var tip = d3.tip().attr('class', 'd3-tip').html(getToolTipText);
  vis.call(tip);

//for editor 
  editor.resize(true);
  editor.setAnimatedScroll(true);

  $("#editor").click(function () {
    var position = editor.getCursorPosition();
    var cursorIndex = new ace.EditSession(editor.getValue()).getDocument().positionToIndex(position);

    var selectedCircle = getNodeFromEditorPosition(cursorIndex);
    highlightCircle(selectedCircle);
  });

  function getNodeFromEditorPosition (cursorIndex) {
    var smallestNode = findSmallestWrappingNode(cursorIndex, currentEditorNode);
    
    if (smallestNode) {
      return $("#n" + smallestNode.uniqueId)[0];
    } 
    console.log("smallestNode does NOT exist");
  }

  function findSmallestWrappingNode (cursorIndex, tmpNode) {
    var tmpChildren = tmpNode.children,
        tmpChild;

    if (!tmpChildren || !tmpChildren.length) {
      return tmpNode;
    }

    for(var i=0, l = tmpChildren.length; i < l; i++) {
      tmpChild = tmpChildren[i];
      if (insideNode(cursorIndex, tmpChild)) {
        tmpNode = findSmallestWrappingNode(cursorIndex, tmpChild);
        break;
      }
    }
    return tmpNode;
  }

  //returns boolean if current position is inside node
  function insideNode (cursorIndex, testNode) {
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

  function highlightCircle (selectedCircle) {
    var zoomScale = zoom.scale();

    d3.select(".selected").style("stroke", getBorderColor)
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
        .style("stroke-width", getBorderWidth)
        .style("stroke", selfBorderColor)
        .style("opacity", getOpacity)
        .attr("r", function (d) {
          return d.r;
        });
  }


  function update(rootNode) {
    root = rootNode;
    nodes = pack.nodes(rootNode);
    
    var editor = ace.edit("editor");

    updateCircles(nodes);
    updateLabels(nodes.filter(hasLabel));
    removePaths();

  }

  function updateCircles (nodes) {
    var circles;

    circles = vis.selectAll("circle")
        .data(nodes, function (d) {
          return d.uniqueId;
        });

    circles
      .style("stroke", getBorderColor)
      .transition()
        .duration(750)
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.r; });
        
    circles.enter().append("svg:circle")
      .attr("class", getClass)
      .attr("id", function (d) {
        return 'n' + d.uniqueId;
      })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .style("stroke", getBorderColor)
      .style("fill", getFillColor)
      .style("stroke-width", getBorderWidth)
      .style("opacity", getOpacity)
      .on("click", onCircleClick)
      .on('mouseover', function(d) {
        if (d.name !== 'root' && d.type !== 'hidden' && d.name !== '[Anonymous]') {
          tip.show(d);
        }
      })
      .on('mouseout', function (d) {
        tip.hide();
      });

    circles.exit()
      .transition()
        .duration(750)
        .attr("r", function(d) { return 1e-6; })
        .remove();

    circles.order();
  }

  function updateLabels (nodes) {
    var labels;

    labels = vis.selectAll("text").data(nodes, function (d) {
        return d.uniqueId;
      });
    
    labels.attr("class", getClass)
      .text(getLabelText)
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .transition()
        .duration(500)
        .style("opacity", getLabelOpacity);
      
    labels
      .enter().append("svg:text")
      .attr("class", getClass)
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("dy", getLabelVerticalOffset)
      .attr("text-anchor", "middle")
      .style("fill", '#000')
      .style("font-size", getFontSize)
      .style("opacity", 1e-6)
      .text(getLabelText)
      .transition()
        .duration(500)
        .style("opacity", getLabelOpacity);
      

    labels.exit()
      .transition()
        .duration(500)
        .style("opacity", 1e-6)
        .remove();

    labels.order();
  }

  function onCircleClick (d, i) {
    //clean up old selection:
    d3.select(".selected").style("stroke", getBorderColor)
      .classed("selected", false);

    //highlight new selection (clicked circle)
    d3.select(this).style("stroke", selfBorderColor)
      .classed("selected", true);
    
    //TODO: add back in
    //toggleDependencies(d, i);

    if (showEditor) {
      setEditorContents(d);
    }

    d3.event.stopPropagation();
  }

  function hasLabel (d) {
    return d.name !== '[Anonymous]' && d.name !== 'root';
  }

  function getLabelOpacity (d) {
    if (d.r * zoom.scale() < 15) {
      return 1e-6;
    } else {
      return 1;
    }
  }

  function getLabelText (d) {
    var text = getToolTipText(d),
        letterWidth = getFontSize(d),
        zoomScale = zoom.scale();

    return text.slice(0, parseInt(d.r * zoomScale / letterWidth * 2 + 2));
  }

  function getLabelVerticalOffset (d, zoomScale) {
    zoomScale = zoom.scale();

    if (d.type === 'file') {
      return -0.75 * d.r;
    } else if (d.r * zoomScale > 20 && d.children && d.children.length < 3 && d.children.length) {
      //hack to avoid most common label collisions
      return -11 / zoomScale;
    } else {
      return 3 / zoomScale;
    }
  }

  function zoomStarted () {
  }

  function zoomed () {
    vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  //var zoomScale;
  var oldZoomScale = 1;
  
  function zoomEnded () {
    var zoomScale = zoom.scale();

    if (zoomScale === oldZoomScale) {
      return;
    }

    var circles = vis.selectAll("circle")
          .style("stroke-width", getBorderWidth);

    var labels = vis.selectAll("text")
          .attr("dy", getLabelVerticalOffset);

    labels.filter(function (d) {
      return this.style.opacity === '1e-06';
    }).style('font-size', getFontSize)
      .text(getLabelText)
      .transition()
        .duration(500)
        .style("opacity", getLabelOpacity);

    labels.filter(function (d) {
      return this.style.opacity !== '1e-06';
    }).transition()
        .duration(500)
        .style("font-size", getFontSize)
        .style("opacity", getLabelOpacity)
      .transition().delay(500).text(getLabelText);

    oldZoomScale = zoomScale;
  }

  function getFontSize (d) {
    var zoomScale = zoom.scale(),
        fontSize;

    if (d.type === 'file') {
      fontSize = 20;
    } else if (d.children && d.children.length) {
      fontSize = 12;
    } else {
      fontSize = 11;
    }

    return fontSize / zoomScale;
  }

  function removePaths () {
    var paths = vis.selectAll(".link").transition().remove();
  }

  function toggleDependencies (d, i) {
    showDependencyPaths(d);
    updateDependencyText(d, i);
  }


  function showDependencyPaths (d) {
    var links = [],
        paths;

    if (!d.dependencies || d.dependencies.length === 0) {
      return;
    }

    links = d.dependencies.map(function(dep) {
      return {
        "source": d,
        "target": dep
      };
    });

    paths = vis.selectAll(".link")
        .data(links);

    paths.enter().append("svg:path")
      .attr("class", "link")
      .style("stroke", pathColor)
      .style("fill", pathColor)
      .style("stroke-width", function (d) {
        return d3.min([d.source.r * 2, d.target.r * 2, 25]);
      })
      .style("stroke-linecap", "round")
      .attr("opacity", 0.9)
      .attr("d", lineData);

    paths.each(function(d) { d.totalLength = this.getTotalLength(); d.highlight = true;})
      .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
      .attr("stroke-dashoffset", function(d) { return d.totalLength; })
      .transition()
        .duration(1000)
        .attr("stroke-dashoffset", function(d) { return -1 * d.totalLength; })
        .remove();

    paths.exit().transition().remove();
  }

  function updateDependencyText (d, i) {
    var labels = vis.selectAll("text"),
        thisD = d,
        thisI = i;

    labels.style("fill", function (d) {
      return getTextFill(d, thisD);
    });
  }

  function setEditorContents (d) {
    var parent,
        range,
        code;

    if (d.treeNode) {
          range = d.treeNode.range;

      parent = getParentFile(d);

      if (!currentEditorNode || parent.uniqueId !== currentEditorNode.uniquId) {
        editor.setValue(parent.sourceCode);

        currentEditorNode = parent;
      }

      var loc = d.treeNode && d.treeNode.loc ? d.treeNode.loc.start : {line:0, column: 0};
      editor.resize(true);
      editor.gotoLine(loc.line, loc.column, true);
    }
  }

  function lineData(d){
    var line = d3.svg.line()
          .x( function(point) { return point.lx; })
          .y( function(point) { return point.ly; }),
        points = [
          {lx: d.source.x, ly: d.source.y},
          {lx: d.target.x, ly: d.target.y}
        ];
        
    return line(points);
  }


  function makeBubbleChart (root)  {
    myRootNode = root;

    // d3.select('.bubble-chart').on("click", function() {
    //   var editor = ace.edit("editor")

    //   while(root.parent){
    //     root = root.parent;
    //   }
    //   update(root);

    //   editor.setValue('var instructions = "Click on a function to see its source code.";');
    // });

    //node = root; //for zoom

    console.log("root: ", root);
    update(root);
  }

  //this is where i hide the files and anonymous circles
  // TODO: should hide them by making them opac, with a background color fill color and a golden border color
  function getBorderColor (d, i, thisD) {
    if (d.name === '[Anonymous]' && d.parent.type === 'file') {
      return anonymousBorderColor;
    } else if (d.name === '[Anonymous]') {
      return anonymousBorderColor;
    } else if (d.name  === 'root') {
      return backgroundColor;
    } else if (d.type === 'file' || d.type === 'inlineScript') {
      return backgroundColor;
    } else if (d.type ==='hidden') {
      return backgroundColor;
    }else {
      return getFillColor(d);
    }
  }

  function getFillColor (d, i, thisD) {
    var parentFile,
        sourceIndex,
        fileFillColorl;

    //ROOT
    if (!d.parent || d.parent === null) {
      return backgroundColor;
    }

    //FILES
    if (d.type === 'file') {
      return backgroundColor;
    }

    //HIDDEN
    if (d.type === 'hidden') {
      return backgroundColor;
    }

    //ANONY
    if (d.name === '[Anonymous]') {
      return backgroundColor;
    }

    parentFile = getParentFile(d);

    sourceIndex = parentFile.sourceIndex;

    fileFillColor = fillColor(sourceIndex);

    return parentFile ? fileFillColor : backgroundColor;
  }


  function getParentFile (d) {
    var temp = d;
    while(temp.parent) {
      //TODO: handle inlineScripts differently
      if (temp.type === 'file' || temp.type === 'inlineScript') {
        return temp;
      }
      temp = temp.parent;
    }
    return null;
  }

  function getOpacity(d, thisD) {
    if (d.type === 'hidden' || d.name === 'root') {
      return 1e-6;
    } else if (d.type === 'file' || d.type === 'inlineScript') {
      return 1e-6;
    } else if (d.name === '[Anonymous]') {
      return 1;
    } else {
      return 0.4;
    }
  }

  function getBorderWidth(d) {
    var zoomScale = zoom.scale();

    return 1.5 / zoomScale;
  }

  function getToolTipText (d) {
    if (d.type === 'file') {
      return getBaseFileName(d.name);
    } else {
      return d.name;
    }
  }

  function getBaseFileName (name) {
    var nameSplit = name.split('/');

    return removeFileNameCash(nameSplit[(nameSplit.length - 1)]);
  }

  function removeFileNameCash (name) {
    var cashSplit = name.split('?');

    if (cashSplit.length > 1) {
      cashSplit.pop();
    }

    return cashSplit.join('');
  }

  function getClass (d) {
    var myClass;
    myClass = d.children && d.children.length ? "parent" : "child";
    // if (d.uniqueId) {
    //   myClass += ' n' + d.uniqueId;
    // }
    return myClass;
  }

  function highlightActiveNode(uniqueId) {
    var nodeData = vis.select('#n' + uniqueId);

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
  }

 

  function resizeVis() {
    container = document.getElementsByClassName("page-content")[0];
    w = container.offsetWidth - 40;
    h = container.offsetHeight - 40;
    r = w > h ? h : w;
    x = d3.scale.linear().range([0, r]);
    y = d3.scale.linear().range([0, r]);

    pack.size([r, r]);
    zoom.size([w, h]);

    $("svg.bubble-chart").height(h).width(w);
    $(".outter-g").attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

    vis.select("outter-g").call(zoom);
    update(root);
  }

  window.bubble = {
    makeBubbleChart: makeBubbleChart,
    updateBubbleChart: update,
    getBorderWidth: getBorderWidth,
    highlightActiveNode: highlightActiveNode,
    resizeVis: resizeVis,
    editor: editor
  }
})(window);



//JUST A TEST:::
var background = chrome.extension.getBackgroundPage(),
    pageTitle = document.getElementsByClassName('webpage-title')[0],
    startTraceButton = document.getElementById('start-tracer'),
    stopTraceButton = document.getElementById('stop-tracer');

bubble.makeBubbleChart(background.codeTree);

pageTitle.innerHTML = background.sourcePageUrl;

startTraceButton.addEventListener("click", listenToTrace);
stopTraceButton.addEventListener("click", stopListeningToTrace);

function listenToTrace () {
  console.log("adding trace listener");

  chrome.runtime.onConnect.addListener(receiveFilterTrace);
  //background.initTrace();

  startTraceButton.style.display = 'none';
  stopTraceButton.style.display = 'inline-block';
}

function stopListeningToTrace () {
  console.log("stopping trace listener");

  //chrome.runtime.onConnect.removeListener(receiveFilterTrace);
  //also need to stop background listener
  //chrome.runtime.onMessage.removeListener(receiveFilterTrace);
  chrome.runtime.reload();

  //startTraceButton.style.display = 'inline-block';
  //stopTraceButton.style.display = 'none';
}

function receiveFilterTrace (port) {
  if (port.name === 'filteredTrace') {
    port.onMessage.addListener(function(msg) {
      if (msg.type === 'trace2') {
        //console.log("TRACE2: ", msg);
        bubble.highlightActiveNode(msg.data.uniqueId);
      }
    })
  }
}

function goToSourcePage() {
  var tabId = background.sourcePageTab;
  console.log("goToSourcePage: ", tabId);
  if (tabId) {
    chrome.tabs.update(tabId, {"selected": true});
  }
}


var showEditor = false;

$(document).ready(function(){
  $(".editor-wrapper").on("hide.bs.collapse", function(){
    $(".side-bar-button").html('<span class="glyphicon glyphicon-resize-full"></span> Show Code')
      .attr('class', 'side-bar-button btn btn-lg btn-info pull-right');
      showEditor = false;
  });
  $(".editor-wrapper").on("show.bs.collapse", function(){
    $(".side-bar-button").html('<span class="glyphicon glyphicon-resize-small"></span> Hide Code')
      .attr('class', 'side-bar-button btn btn-lg pull-right btn-danger');
      showEditor = true;
  });
  $(".webpage-title").click(goToSourcePage);

  $( ".editor-wrapper" ).resizable({
      handles: 's, e, sw',
      maxHeight: 1000,
      maxWidth: 1000,
      minHeight: 100,
      minWidth: 200,
      stop: function (e) {
        window.bubble.editor.resize();
        console.log("called editor.resize()");
      }
    });


});

var resizeDelayTimer;

$(window).resize(function () {
  clearTimeout(resizeDelayTimer);
  resizeDelayTimer = setTimeout(bubble.resizeVis, 200);
});



