function makeBubbleChart (root)  {
  var w = 1280,
        h = 800,
        r = 720,
        x = d3.scale.linear().range([0, r]),
        y = d3.scale.linear().range([0, r]),
        node;

  var pack = d3.layout.pack()
      .sort(null)
      .size([r, r])
      .value(function(d) { return d.size; });

  var vis = d3.select("body").insert("svg:svg", "h2")
      .attr("width", w)
      .attr("height", h)
    .append("svg:g")
      .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

  node = root; //for zoom

  console.log("root: ", root);

  function update(rootNode) {
    var nodes;

    // pack = d3.layout.pack()
    //   .size([r, r])
    //   .value(function(d) { return d.size; });

    nodes = pack.nodes(rootNode);

    var circles = vis.selectAll("circle")
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
        .on("click", function(d) { toggleDependencies(d);});

    circles.exit()
      .remove();

    var labels = vis.selectAll("text")
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


  var lastNode;
  function toggleDependencies (d) {
    //remove dependencies from last node
    if (lastNode) {
      
      console.log("last node children: ", lastNode.children.length);
      lastNode.children = lastNode.children.filter(function(child) {
        //console.log("child type (",child.type,") !== dependency: ", child.type !== 'dependency');
        return child.type !== 'dependency';
      });
      console.log("last node children: ", lastNode.children.length);
      lastNode = null;
    }
    //console.log("d.type = ", d.type);
    if (d.type === 'dependency'){
      console.log("root: ", root);
      update(root);
      //console.log("node type is dependency");
      return;
    }
    d.children = d.children.concat(d.dependencies.map(function(dep) {
    //NOTE: size should be brought down to only 30% of parent vol
      return {name: dep.name, type: 'dependency', size: 2};
    }));
    
    //console.log("root: ", root);
    //zoom(node == d ? root : d);
    update(root);

    lastNode = d;
  }
    

  d3.select(window).on("click", function() { zoom(root); });

  function zoom(d, i) {
    var k = r / d.r / 2;
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    var t = vis.transition()
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