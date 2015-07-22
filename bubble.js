function makeBubbleChart (root)  {
  var w = 1280,
        h = 800,
        r = 720,
        x = d3.scale.linear().range([0, r]),
        y = d3.scale.linear().range([0, r]),
        node;

  var pack = d3.layout.pack()
      //.sort(null)
      .size([r, r])
      .value(function(d) { return d.size; });

  var vis = d3.select("body").insert("svg:svg", "h2")
      .attr("width", w)
      .attr("height", h)
    .append("svg:g")
      .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

  node = root; //for zoom

  //console.log("root: ", root);

  function update(rootNode) {
    var nodes,
        circles,
        labesl;

    nodes = pack.nodes(rootNode);

    circles = vis.selectAll("circle")
        .data(nodes);

    circles
      .attr("class", function(d) { 
          return d.children ? "parent" : "child"; })
      .style("stroke", function(d) {
        if (d.type && d.type === 'dependency') {
          return "black";
        } else {
          return "#999";
        }
      })
      .transition()
        .duration(750)
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.r; });
        
    circles.enter().append("svg:circle")
      .attr("class", function(d) { 
        return d.children ? "parent" : "child"; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .style("stroke", function(d) {
        if (d.type && d.type === 'dependency') {
          return "black";
        } else {
          return "#999";
        }
      })
      .on("click", function(d, i) { toggleDependencies(d, i);});

    circles.exit()
      .remove();

    labels = vis.selectAll("text")
        .data(nodes);

    labels.attr("class", function(d) { return d.children ? "parent" : "child"; })
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });
      
    labels.enter().append("svg:text")
        .attr("class", function(d) { return d.children ? "parent" : "child"; })
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

    circles.style("stroke", function(d, i) {

      if (i === thisI) {
        return "red";
        //TODO: can I match objects with indexOf?
      } else if (thisD.dependencies.indexOf(d) >= 0) {
        return "black";
      } else {
        return "steelblue";
      }
    }).style("stroke-width", 1.5);


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
      .style("stroke", "black")
      .style("stroke-width", 3)
      .style("stroke-linecap", "round")
      .attr("opacity", 1)
      .attr("d", d3.svg.diagonal());

    paths.each(function(d) { d.totalLength = this.getTotalLength(); })
      .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
      .attr("stroke-dashoffset", function(d) { return d.totalLength; })
      .transition()
        .duration(function(d) {
          return 300;
        })
        .ease("linear")
        .attr("stroke-dashoffset", 0)
      .transition()
        .delay(300)
        .duration(1000)
        .attr("opacity", 1e-6)
        .remove();

    paths.exit().remove();
  }
    

  d3.select(window).on("click", function() { zoom(root); });

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