(function (exports) {
  var w = 730,
        h = 750,
        r = 720,
        x = d3.scale.linear().range([0, r]),
        y = d3.scale.linear().range([0, r]),
        node,
        zoomScale = 1,
        myRootNode,

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
        pathColor = "#FFFFFF";

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
    .scaleExtent([1, 12])
    .size([w, h])
    .on("zoom", zoomed)
    .on("zoomend", zoomEnded);

  var vis = d3.select("svg.bubble-chart")
        .attr("width", w)
        .attr("height", h)
        .call(zoom)
        .append("svg:g")
        .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

  /* Initialize tooltip */
  // var tip = d3.tip().attr('class', 'd3-tip').html(getToolTipText);
  // vis.call(tip);

  
  function update(rootNode) {

    console.log("rootNode: ", rootNode);
    var nodes = pack.nodes(rootNode),
        editor = ace.edit("editor");

    updateCircles(nodes);
    updateLabels(nodes);
    removePaths();

    editor.setValue('var instructions = "Click on a function to see its source code.";');
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
      .style("stroke-width", 1)
      .style("opacity", getOpacity)
      .on("click", onCircleClick)
      .on("dblclick", function (d) {root = d; update(root); d3.event.stopPropagation();})//zoom(node == d ? root : d);d3.event.stopPropagation();})
      .on('mouseover', function(d) {
        if (d.name !== 'root' && d.type !== 'hidden') {
          //tip.show(d);
        }
        if (d.type === 'file' || (d.name === '[Anonymous]' && d.parent.type === 'file')) {
          //show border of hidden anonymous circles (maybe including files)
          d3.select(this).style("opacity", 1);
        }
      })
      .on('mouseout', function (d) {
        //tip.hide();

        if (d.type === 'file' || (d.name === '[Anonymous]' && d.parent.type === 'file')) {
          //show border of hidden anonymous circles (maybe including files)
          d3.select(this).style("opacity", 1e-6);
        }
      });

    circles.exit()
      .remove();

    circles.order();
  }

  function onCircleClick (d, i) {
    //clean up old selection:
    d3.select(".selected").style("stroke", getBorderColor)
      //.style("stroke-width", getBorderWidth)
      .classed("selected", false);

    //highlight new selection (clicked circle)
    d3.select(this).style("stroke", selfBorderColor)
      //.style("stroke-width", 4)
      .classed("selected", true);

    toggleDependencies(d, i);

    d3.event.stopPropagation();
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
        .delay(500)
        .duration(500)
        .style("opacity", getLabelOpacity);
      
    labels.enter().append("svg:text")
      .attr("class", getClass)
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("dy", getLabelVerticalOffset)
      .attr("text-anchor", "middle")
      .style("fill", '#000')
      .style("font-size", function (d) {
        if (d.type === 'file') {
          return 20;
        } else {
          return 11;
        }
      })
      //.style("font-weight", 400)
      //.style("opacity", 1e-6)
      .style("opacity", getLabelOpacity)
      .text(getLabelText);
      // .transition()
      //   .delay(500)
      //   .duration(750)
      //   .style("opacity", getLabelOpacity);

    labels.exit()
      .transition()
        .duration(500)
        .style("opacity", 1e-6)
        .remove();

    labels.order();
  }

  function getLabelOpacity (d) {
    // var textOpacityScale = d3.scale.sqrt()
    //       .domain([20, r])
    //       .range([1, 0.1])
    if (d.r < 15 || d.name === '[Anonymous]' || d.name === 'root') {
      return 1e-6;
    } else {
      //textOpacityScale(d.r);
      return 1;
    }
  }

  //TODO: make simpler
  function getLabelText (d) {
    var text = d.name,
        textLength = text.length,
        textSplit,
        letterWidth = getFontSize(d),
        circlePadding = 3,
        minTextLength = 3;

    if (d.name === '[Anonymous]' || d.name === 'root') {
      return '';
    }
    
    if (textLength * letterWidth > (d.r * 2)) {
      if (d.type === 'file') {
        text = UTILS.getBaseFileName(d);
      } else {
        text = UTILS.getBaseName(d);
      }
    }

    while ((text.length * letterWidth > d.r * circlePadding) && (text.length > minTextLength)) {
      text = text.slice(0, -1);
    }

    return text;
  }

  function getLabelVerticalOffset (d, zoomScale) {
    zoomScale = zoomScale || 1;

    if (d.type === 'file') {
      return -1 * d.r / zoomScale + 15;
    } else {
      return (0.35 / zoomScale) + "em";
    }
  }

  function zoomed() {
    vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    //vis.selectAll("circle").style("stroke-width", 1.5 / d3.event.scale + "px");
    zoomScale = d3.event.scale; //replace with zoom.scale()

    // vis.selectAll("text").style("font-size", 22 / d3.event.scale + "px");
    //vis.selectAll(".link").style("stroke-width", .5 / d3.event.scale + "px");

    //console.log("vis.selectAll text: ", vis.selectAll("text")[0].length);
  }

  var zoomScale;
  
  function zoomEnded () {
    console.log("zoomEnded, zoomScale: ", zoomScale);
    console.log("zoom.scale()", zoom.scale());
    //updateLabels();
    var t = 0;
    vis.selectAll("text").style("opacity", function (d) {
      if (d.r * zoomScale > 15) {
        return 1;
      } else {
        return 1e-6;
      }
    })
    .style("font-size", 22 / zoomScale + "px");

    //TODO: scale text y offset with zoom

    // pack.padding(2 / zoomScale);
    // update(myRootNode);
  }

  function getFontSize (d) {
    var fontScale = d3.scale.sqrt()
      .domain([20, r])
      .range([14, 50]);

    return fontScale(d.r);
  }

  function getFontWeight (d) {
    if (d.r > 75) {
      return 800;
    } else {
      return 400;
    }
  }

  function removePaths () {
    var paths = vis.selectAll(".link").transition().remove();
  }

  function toggleDependencies (d, i) {
    //zoom(node == d ? root : d);
    circleClickAction(d, i);
    showDependencyPaths(d);
    updateDependencyText(d, i);
    setEditorContents(d);
  }

  function circleClickAction (d, i) {
    var circles = vis.selectAll("circle:not(.selected)"),
        thisD = d,
        thisI = i;

    circles
      .transition()
        .delay(500)
        .duration(500)
        .style("stroke", function(d,i) {
          return getBorderColor(d,i,thisD);
        })
        .style("fill", function (d,i) {
          return getFillColor(d,i,thisD);
        });
        //.style("stroke-width", getBorderWidth)
        // .style("opacity", function(d) {
        //   return getOpacity(d, thisD);
        // })
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
      // .style("text-shadow", function (d) {
      //   return getTextShadow(d, thisD)
      // });
  }

  function getTextFill(d, thisD) {
    if (thisD && thisD.dependencies && thisD.dependencies.indexOf(d) >= 0) {
      return "#FFFFFF";
    } else if (d.children && d.children.length) {
      return "black";
    } else if (!d.dependencies || !d.dependencies.length){
      return "#FFFFFF";
    } else {
      return "#1f77b4";
    }
  }

  function setEditorContents (d) {
    var parent = d,
        editor = ace.edit("editor"),
        range;

    if (d.treeNode) {
          range = d.treeNode.range;

      while (parent) {
        if (parent.type === 'file' || parent.type === 'inlineScript') {
          fileName = parent.name;
          break;
        }
        parent = parent.parent;
      }

      if (d.type === 'file' || d.type === 'innerHTML') {
        editor.setValue(parent.sourceCode);
      } else {
        editor.setValue(parent.sourceCode.slice(range[0], range[1]));
      }
      editor.navigateFileStart();
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

  // function zoom(d, i) {
  //   var k = r / d.r / 2,
  //       t;

  //   x.domain([d.x - d.r, d.x + d.r]);
  //   y.domain([d.y - d.r, d.y + d.r]);

  //   t = vis.transition()
  //       .duration(d3.event.altKey ? 7500 : 750);

  //   t.selectAll("circle")
  //       .attr("cx", function(d) { return x(d.x); })
  //       .attr("cy", function(d) { return y(d.y); })
  //       .attr("r", function(d) { return k * d.r; });

  //   t.selectAll("text")
  //       .attr("x", function(d) { return x(d.x); })
  //       .attr("y", function(d) { return y(d.y); })
  //       .style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

  //   node = d;
  //   d3.event.stopPropagation();
  // }



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

  var fillColor = d3.scale.category10();

  function getFillColor (d, i, thisD) {

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

    return fillColor(getParentFile(d).sourceIndex);
  }

  function getParentFile (d) {
    var temp = d;
    while(temp.parent) {
      if (temp.type === 'file') {
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
    } if (d.name === '[Anonymous]' && d.parent.type === 'file') {
      return 1e-6;
    } else if (d.name === '[Anonymous]') {
      return 1;
    } else {
      return 0.4;
    }
  }

  function getBorderWidth(d) {
    if (d.type === 'file' || d.type === 'inlineScript') {
      return 5;
    } else if (d.name === '[Anonymous]') {
      return 0.5;
    } else {
      return 1.5;
    }
  }

  function getToolTipText (d) {
    if (d.type === 'file') {
      return getBaseFileName(d.name);
    } else if (d.parent && d.parent.type === 'file' && d.parent.children.length === 1 && d.name === '[Anonymous]') {
      return getBaseFileName(d.parent.name) + '<br/>' + 'Anon.';
    } else if (d.name === '[Anonymous]') {
      return 'Anon.';
    } else {
      return d.name;
    }
  }

  function getBaseFileName (name) {
    var nameSplit = name.split('/');
    return nameSplit[(nameSplit.length - 1)];
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

  window.bubble = {
    makeBubbleChart: makeBubbleChart,
    updateBubbleChart: update,
    getBorderWidth: getBorderWidth,
    highlightActiveNode: highlightActiveNode
  }
})(window);



//JUST A TEST:::
var background = chrome.extension.getBackgroundPage(),
    pageTitle = document.getElementsByClassName('webpage-title')[0],
    startTraceButton = document.getElementById('start-tracer'),
    stopTraceButton = document.getElementById('stop-tracer');

bubble.makeBubbleChart(background.codeTree);

pageTitle.innerHTML = background.pageUrl;

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


