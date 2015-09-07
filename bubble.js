(function (exports) {
  var w = 730,
        h = 750,
        r = 720,
        x = d3.scale.linear().range([0, r]),
        y = d3.scale.linear().range([0, r]),
        node,

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
        .value(function(d) { return d.size; });

  var vis = d3.select("svg.bubble-chart")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

  /* Initialize tooltip */
  var tip = d3.tip().attr('class', 'd3-tip').html(getToolTipText);
  vis.call(tip);

  function update(rootNode) {
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
      .style("fill", getFillColor)
      .style("stroke-width", getBorderWidth)
      .style("opacity", getOpacity)
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
      .on("dblclick", function (d) {root = d; update(root); d3.event.stopPropagation();})//zoom(node == d ? root : d);d3.event.stopPropagation();})
      .on('mouseover', function(d) {
        if (d.name !== 'root' && d.type !== 'hidden') {
          tip.show(d);
        }
      })
      .on('mouseout', function (d) {
        tip.hide();
      });

    circles.exit()
      .remove();

    circles.order();
  }

  function onCircleClick (d, i) {
    //clean up old selection:
    d3.select(".selected").style("stroke", getBorderColor)
      .style("stroke-width", getBorderWidth)
      .classed("selected", false);

    //highlight new selection (clicked circle)
    d3.select(this).style("stroke", selfBorderColor)
      .style("stroke-width", 4)
      .classed("selected", true);

    toggleDependencies(d, i);

    d3.event.stopPropagation();
  }

  function updateLabels (nodes) {
    var labels;

    labels = vis.selectAll("text")
        .data(nodes, function (d) {
          return d.uniqueId;
        });

    labels.attr("class", getClass)
      .style("text-shadow", getTextShadow)
      .style("opacity", 1e-6)
      .style("fill", getTextFill)
      .style("font-size", getFontSize)
      .style("font-weight", getFontWeight)
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
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("text-shadow", getTextShadow)
      .style("fill", getTextFill)
      .style("font-size", getFontSize)
      .style("font-weight", getFontWeight)
      .style("opacity", 1e-6)
      .text(getLabelText)
      .transition()
        .delay(500)
        .duration(750)
        .style("opacity", getLabelOpacity);

    labels.exit()
      .transition()
        .duration(500)
        .style("opacity", 1e-6)
        .remove();

    labels.order();
  }

  function getLabelOpacity (d) {
    var textOpacityScale = d3.scale.sqrt()
          .domain([20, r])
          .range([1, 0.1])

    if (d.r < 15 || d.name === '[Anonymous]' || d.name === 'root') {
      return 1e-6;
    } else {
      return textOpacityScale(d.r);
    }
  }

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
        })
        .style("stroke-width", getBorderWidth)
        .style("opacity", function(d) {
          return getOpacity(d, thisD);
        })
  }

  function showDependencyPaths (d) {
    var links = [],
        paths;

    if (d.dependencies.length === 0) {
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
    })
      .style("text-shadow", function (d) {
        return getTextShadow(d, thisD)
      });
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

  function getTextShadow (d, thisD) {
    if (thisD && thisD.dependencies && thisD.dependencies.indexOf(d) >= 0) {
      return;
    } else if (d.children && d.children.length) {
      return "0 0 5px #FFFFFF";
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

  function zoom(d, i) {
    var k = r / d.r / 2,
        t;

    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    t = vis.transition()
        .duration(d3.event.altKey ? 7500 : 750);

    t.selectAll("circle")
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); })
        .attr("r", function(d) { return k * d.r; });

    t.selectAll("text")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

    node = d;
    d3.event.stopPropagation();
  }



  function makeBubbleChart (root)  {

    d3.select('.bubble-chart').on("click", function() {
      var editor = ace.edit("editor")

      while(root.parent){
        root = root.parent;
      }
      update(root);

      editor.setValue('var instructions = "Click on a function to see its source code.";');
    });

    node = root; //for zoom

    update(root);
  }

  function getBorderColor (d, i, thisD) {
    if (thisD && thisD.dependencies.indexOf(d) >= 0) {
      return depBorderColor;
    } else if (d.name === '[Anonymous]') {
      return anonymousBorderColor;
    } else if (d.name  === 'root') {
      return backgroundColor;
    } else if (d.type === 'file' || d.type === 'inlineScript') {
      return fileBorderColor;
    } else if (d.dependencies.length === 0) {
      return noDepBorderColor;
    }else {
      return defaultBorderColor;
    }
  }

  function getFillColor (d, i, thisD) {
    if (thisD && thisD.dependencies.indexOf(d) >= 0) {
      return depFillColor;
    } else if (d.name === '[Anonymous]') {
      return anonymousFillColor;
    } else if (d.name === 'root') {
      return backgroundColor;
    } else if (d.type === 'file' || d.type === 'inlineScript') {
      return fileFIllColor;
    } else if (d.dependencies.length === 0) {
      return noDepFillColor;
    } else if (!d.children || d.children.length === 0) {
      return noChildFillColor;
    }else {
      return defaultFillColor;
    }
  }

  function getOpacity(d, thisD) {
    if (d.type === 'hidden' || d.name === 'root') {
      return 1e-6;
    } else if (d.type === 'file' || d.type === 'inlineScript') {
      return 1;
    } else if (d.name === '[Anonymous]') {
      return 1;
    } else if (!d.dependencies || !d.dependencies.length) {
      return 1;
    } else if (thisD && thisD.dependencies && thisD.dependencies.map(function(dep){return dep.uniqueId;}).indexOf(d.uniqueId) > -1) {
       return 1;
    } else if (!d.children || !d.children.length) {
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
    console.log("hightlightActiveNode fired");
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
        console.log("TRACE2: ", msg);
        bubble.highlightActiveNode(msg.data.uniqueId);
      }
    })
  }
}


