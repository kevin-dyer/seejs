var TextUtils = require('./text_module.js');

var tip;

var TipUtils = {

  initToolTip: function () {
    tip = d3.tip().attr('class', 'd3-tip').html(TextUtils.getToolTipText);
  },

  getToolTip: function () {
    return tip;
  }
};

module.exports = TipUtils;