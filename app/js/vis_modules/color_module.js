var TreeUtils = require('./tree_module.js');

var fillColorList = d3.scale.category10().range(),
    fillColorListLength = fillColorList.length,
    backgroundColor = "#FFF",
    selfBorderColor = "#f33",
    anonymousBorderColor = "#ffcf40";

function getFillColor (d) {
  var parentFile,
      sourceIndex,
      fileFillColor;

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

  fillColor: function (domain) {
    return fillColorList[domain % fillColorListLength];
  },

  getBorderColor: function (d) {
    if (d.name === '[Anonymous]') {
      return anonymousBorderColor;
    } else if (d.name  === 'root') {
      return backgroundColor;
    } else if (d.type === 'file' || d.type === 'inlineScript') {
      return backgroundColor;
    } else if (d.type ==='hidden') {
      return backgroundColor;
    } else if (d.type === 'property' && d.name === 'render') {
      return '#000000';
    } else {
      return getFillColor(d);
    }
  },

  getFillColor: getFillColor
}

module.exports = ColorUtils;