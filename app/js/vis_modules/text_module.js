var SelectionUtils = require('./selections_module.js');

var zoomScale = window.zoomScale;

function getToolTipText (d) {
  if (d.type === 'file') {
    return getBaseFileName(d.name);
  } else if (d.name === '[Anonymous]') { //assuming parent is script and only has 1 child
    return d.parent.name;
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

function hasLabel (d) {
  return d.name !== '[Anonymous]' && d.name !== 'root';
}

function isHidden () {
  return this.style.opacity === '1e-06';
}

function isVisible() {
  return !isHidden();
}

function getLabelOpacity (d) {
  if (d.r * zoomScale < 15) {
    return 1e-6;
  } else {
    return 1;
  }
}

function getLabelText (d) {
  var text = getToolTipText(d),
      letterWidth = getFontSize(d);

  return text ? text.slice(0, parseInt(d.r * zoomScale / letterWidth * 2 + 2)) : '';
}

function getFontSize (d) {
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

function getLabelVerticalOffset (d) {
  if (d.type === 'file' || d.type === 'inlineScript') {
    return -0.75 * d.r;
  } else if (d.r * zoomScale > 20 && d.children && d.children.length < 3 && d.children.length) {
    //hack to avoid most common label collisions
    return -11 / zoomScale;
  } else {
    return 3 / zoomScale;
  }
}

function updateLabelsAfterZoom () {
  var labels = SelectionUtils.getLabels();

  labels.attr("dy", getLabelVerticalOffset);
  labels.filter(function (d) {
    isHidden.bind(this);
  })
    .style('font-size', getFontSize)
    .text(getLabelText)
    .transition()
      .duration(500)
      .style("opacity", getLabelOpacity);

  labels.filter(function (d) {
    isVisible.bind(this);
  })
    .transition()
      .duration(500)
      .style("font-size", getFontSize)
      .style("opacity", getLabelOpacity)
    .transition()
      .delay(500)
      .text(getLabelText);
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