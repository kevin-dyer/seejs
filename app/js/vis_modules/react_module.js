var BubbleJS = require('./bubble_js_module.js'),
    ExtensionUtils = require('./extension_module.js');

var ReactUtils = {
  bubbleVis: function () {
    var root = ExtensionUtils.getReactComponentRoot();
    //var root = chrome.

    console.log("React Components Root: ", root);
    //BubbleJS.update(root);
  }
}

module.exports = ReactUtils;