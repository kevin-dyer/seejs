function makeBubbleChart (root, sourceCode)  {
  var w = 720,
      h = 750,
      r = 720,
      x = d3.scale.linear().range([0, r]),
      y = d3.scale.linear().range([0, r]),
      node,


      //brewer color solid color scale
      colorList = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)'],
      colorListLength = colorList.length, //9

      //colors:
      backgroundColor = "#FFF", //not working
      selfBorderColor = "#f33",
      depBorderColor = "black",
      defaultBorderColor = "#1C5787", //steelblue", //colorList[8],
      anonymousBorderColor = "#ffcf40",
      noDepBorderColor = "steelblue",
      fileBorderColor = colorList[8],

      defaultFillColor = "#1f77b4", //colorList[7],
      selfFillColor = defaultFillColor,
      depFillColor = colorList[7],
      anonymousFillColor = backgroundColor,
      noDepFillColor = "#7D7D7D",
      noChildFillColor = "#ccc",
      fileFIllColor = colorList[1],
      pathColor = "#FFFFFF";

  function getBorderColor (d, i, thisD, thisI) {
    if (typeof thisI === 'number' && i === thisI) {
      return selfBorderColor;
    } else if (thisD && thisD.dependencies.indexOf(d) >= 0) {
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

  function getFillColor (d, i, thisD, thisI) {
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

  function getBorderWidth(d, i, thisI) {
    if (d.type === 'file' || d.type === 'inlineScript') {
      return 5;
    } else if (typeof i === 'number' && typeof thisI === 'number' && i === thisI) {
      return 4;
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
    return d.children && d.children.length ? "parent" : "child";
  }

  var pack = d3.layout.pack()
      .sort(null)
      .size([r, r])
      .value(function(d) { return d.size; });

  var vis = d3.select("body").insert("svg:svg", "h2")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "bubble-chart")
    .append("svg:g")
      .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

  //INIT TOOLTIP
  /* Initialize tooltip */
  var tip = d3.tip().attr('class', 'd3-tip').html(getToolTipText);
  /* Invoke the tip in the context of your visualization */
  vis.call(tip)


  node = root; //for zoom

  function update(rootNode) {
    var nodes = pack.nodes(rootNode),
        editor = ace.edit("editor");

    updateCircles(nodes);
    updateLabels(nodes);
    removePaths();

    editor.setValue('var instructions = "Click on a function to see its source code.";');
  }

  update(root);

  function updateCircles (nodes) {
    var circles;

    circles = vis.selectAll("circle")
        // .data(nodes, function (d) {
        //   return d.uniqueId;
        // });
      .data(nodes);

    circles
      .attr("class", getClass)
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
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .style("stroke", getBorderColor)
      .style("fill", getFillColor)
      .style("stroke-width", getBorderWidth)
      .style("opacity", getOpacity)
      .on("click", function(d, i) { toggleDependencies(d, i); d3.event.stopPropagation();})
      .on("dblclick", function (d) {root = d; update(root); d3.event.stopPropagation();})//zoom(node == d ? root : d);d3.event.stopPropagation();})
      .on('mouseover', function(d) {
        if (d.name !== 'root' && d.type !== 'hidden') {
          tip.show(d);
        }

        d3.select(this).style("stroke", "black");
      })
      .on('mouseout', function (d) {
        tip.hide;
        d3.select(this).style("stroke", getBorderColor);
      });

    circles.exit()
      .remove();

    circles.order();
  }

  function updateLabels (nodes) {
    var labels;

    labels = vis.selectAll("text")
        .data(nodes, function (d) {
          return d.uniqueId;
        });

    labels.attr("class", getClass)
      .transition()
        .duration(750)
        .style("opacity", getLabelOpacity)
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });
      
    labels.enter().append("svg:text")
      .filter(function (d) {
        return (d.r > 15 && d.name !== '[Anonymous]' && d.name !== 'root');
      })
      .attr("class", getClass)
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("text-shadow", getTextShadow)
      .style("fill", getTextFill)
      .style("font-size", getFontSize)
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
    return 1;
  }

  function getLabelText (d) {
    var text = d.name,
        textLength = text.length,
        textSplit;
    
    if (textLength * 3 > d.r) {
      text = UTILS.getBaseName(d);
    }

    while (text.length * 3 > d.r/d.depth && text.length >= 3) {
      text = text.slice(0, -1);
    }

    return text;
  }

  
  
  //11(max depth of 3) - 26(depth of 0)
  function getFontSize (d) {

    var fontScale = d3.scale.linear()
      .domain([0, 4])
      .range([30, 11]);

    return d3.max([fontScale(d.depth), 11]);
    // if (d.children && d.children.length) {
    //   return 26/((d.depth + 1));
    // } else {
    //   return 11;
    // }
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
    var circles = vis.selectAll("circle"),
        thisD = d,
        thisI = i;

    circles.style("stroke", function(d,i) {
      return getBorderColor(d,i,thisD,thisI);
    })
      .style("fill", function (d,i) {
        return getFillColor(d,i,thisD,thisI);
      })
      .style("stroke-width", function (d, i){
        return getBorderWidth(d, i, thisI);
      })
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
      .style("stroke-width", function (d) {
        return d3.min([d.source.r * 2, d.target.r * 2, 25]);
      })
      .style("stroke-linecap", "round")
      .attr("opacity", 0.40)
      .attr("d", d3.svg.diagonal());

    paths.each(function(d) { d.totalLength = this.getTotalLength(); d.highlight = true;})
      //.attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
      //.attr("stroke-dashoffset", function(d) { return d.totalLength; })
      .transition()
        .duration(1000)
        //.attr("stroke-dashoffset", function(d) { return -1 * d.totalLength; })
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

    console.log("setting Editor contents...");

    if (d.treeNode) {
          range = d.treeNode.range;

      while (parent) {
        if (parent.type === 'file' || parent.type === 'inlineScript') {
          fileName = parent.name;
          break;
        }
        parent = parent.parent;
      }

      console.log("adding function to editor! parent: ", parent.name);
      console.log("sourceCode typeof: ", typeof parent.sourceCode);
      if (d.type === 'file' || d.type === 'innerHTML') {
        editor.setValue(parent.sourceCode);
      } else {
        editor.setValue(parent.sourceCode.slice(range[0], range[1]));
      }
      editor.navigateFileStart();
    }
  }
    

  d3.select('.bubble-chart').on("click", function() {
    var editor = ace.edit("editor");

    while(root.parent){
      root = root.parent;
    }
    update(root);

    editor.setValue('var instructions = "Click on a function to see its source code.";');
  });

  node = root; //for zoom
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
}
