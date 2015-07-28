function makeBubbleChart (root)  {
  var w = 800,
      h = 800,
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
      anonymousBorderColor = colorList[4],
      noDepBorderColor = "steelblue",

      defaultFillColor = "#1f77b4", //colorList[7],
      selfFillColor = defaultFillColor,
      depFillColor = colorList[7],
      anonymousFillColor = backgroundColor,
      noDepFillColor = "#7D7D7D",
      noChildFillColor = "#ccc",
      pathColor = "#FFFFFF";

  function getBorderColor (d, i, thisD, thisI) {
    //console.log("d, i, thisD, thisI: ", !!d, ', ', i, ', ', !!thisD, ', ', thisI)
    //if (typeof thisI === 'number' && i === thisI) {
    if (thisD && d === thisD) {
      //console.log("self border color: ", selfBorderColor);
      return selfBorderColor;
    } else if (thisD && thisD.dependencies.indexOf(d) >= 0) {
      //console.log("depBorderColor: ", depBorderColor);
      return depBorderColor;
    } else if (d.name === '[Anonymous]') {
      //console.log("anonymousBorderColor: ", anonymousBorderColor);
      return anonymousBorderColor;
    } else if (d.name  === 'root') {
      return anonymousBorderColor;
    } else if (d.dependencies.length === 0) {
      //console.log("noDepBorderColor: ", noDepBorderColor);
      return noDepBorderColor;
    }else {
      //console.log("defaultBorderColor: ", defaultBorderColor);
      return defaultBorderColor;
    }
  }

  function getFillColor (d, i, thisD, thisI) {
    if (thisD && thisD.dependencies.indexOf(d) >= 0) {
      return depFillColor;
    } else if (d.name === '[Anonymous]') {
      return anonymousFillColor;
    } else if (d.name === 'root') {
      return defaultFillColor;
    } else if (d.dependencies.length === 0) {
      return noDepFillColor;
    } else if (!d.children || d.children.length === 0) {
      return noChildFillColor;
    }else {
      return defaultFillColor;
    }
  }

  function getOpacity(d, thisD) {
    if (d.type === 'hidden') {
      return 1e-6;
    } else if (d.name === '[Anonymous]' || !d.dependencies.length || (thisD && thisD.dependencies.indexOf(d) >= 0)) {
      return 1;
    } else if (!d.children || !d.children.length) {
      return 1;
    } else {
      return 0.4;
    }
  }

  function getClass (d) {
    return d.children && d.children.length ? "parent" : "child";
  }

  var pack = d3.layout.pack()
      .sort(null)
      .size([r, r])
      .value(function(d) { return d.size; });

  //remove old one
  d3.select("svg").remove();

  var vis = d3.select("body").insert("svg:svg", "h2")
      .attr("width", w)
      .attr("height", h)
    .append("svg:g")
      .style("fill", backgroundColor)
      .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

  //INIT TOOLTIP
  /* Initialize tooltip */
  var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.name; });

  /* Invoke the tip in the context of your visualization */
  vis.call(tip)

  node = root; //for zoom

  //console.log("root: ", root);

  function update(rootNode) {
    var nodes,
        circles,
        labels;

    nodes = pack.nodes(rootNode);


    circles = vis.selectAll("circle")
        .data(nodes, function (d) {
          return UTILS.getId(d);
        });

    circles
      .attr("class", getClass)
      .style("stroke", function (d, i) {
        return getBorderColor(d, i);
      })
      .style("fill", function (d, i) {
        return getFillColor(d, i);
      })
      .style("stroke-width", 1.5)
      .style("opacity", function(d) {
        return getOpacity(d);
      })
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
      .style("stroke", function (d,i) {
        return getBorderColor(d, i);
      })
      .style("fill", function (d,i) {
        return getFillColor(d,i);
      })
      .style("stroke-width", 1.5)
      .style("opacity", function(d) {
        return getOpacity(d);
      })
      .on("click", function(d, i) { toggleDependencies(d, i); d3.event.stopPropagation();})
      .on("dblclick", function (d) {vis.selectAll('.link').transition().remove(); root = d; update(root); })//zoom(node == d ? root : d);d3.event.stopPropagation();})
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    circles.exit()
      .remove();

    circles.order();

    labels = vis.selectAll("text")
        .data(nodes, function (d) {
          return UTILS.getId(d);
        });

    labels.attr("class", getClass)
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });
      
    labels.enter().append("svg:text")
        .attr("class", getClass)
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
        .text(function(d) { return d.name === '[Anonymous]' || d.name === 'root' ? '' : d.name; });

    labels.exit().remove();
  }

  update(root);


  function toggleDependencies (d, i) {
    
    //zoom(node == d ? root : d);

    //highlighting self and dependencies
    var circles = vis.selectAll("circle"),
        thisD = d,
        thisI = i,
        links = [],
        paths;

    circles.style("stroke", function(d,i) {
      return getBorderColor(d,i,thisD,thisI);
    })
      .style("fill", function (d,i) {
        return getFillColor(d,i,thisD,thisI);
      })
      .style("stroke-width", function (d, i) {
        if (typeof thisI === 'number' && i === thisI) {
          //console.log("self border color: ", selfBorderColor);
          return 3;
        } else {
          return 1.5;
        }
      })
      .style("opacity", function(d) {
        return getOpacity(d, thisD);
      })


    if (d.dependencies.length === 0) {
      return;
    }
    //TODO: move to addLinks function (d)
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
      .attr("opacity", 0.60)
      .attr("d", d3.svg.diagonal());

    paths.each(function(d) { d.totalLength = this.getTotalLength();})
       .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
       .attr("stroke-dashoffset", function(d) { return d.totalLength; })
      .transition()
        .duration(1000)
        .attr("stroke-dashoffset", function(d) { return -1 * d.totalLength; })
        .remove();

    paths.exit().remove();
  }
    

  d3.select(window).on("click", function() { 
    while(root.parent){
      root = root.parent;
    }
    update(root);
  });///zoom(root); });

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


  

  

  // d3.text("tree.js", function (error, data) {
  //   console.log("tree.js data!!, ", data);
  // });





}