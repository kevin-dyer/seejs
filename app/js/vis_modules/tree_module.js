var TreeUtils = {
  getParentFile: function (d) {
    var temp = d;
    while(temp.parent) {
      //TODO: handle inlineScripts differently
      if (temp.type === 'file' || temp.type === 'inlineScript') {
        return temp;
      }
      temp = temp.parent;
    }
    return null;
  },

  getDataValue: function(d) { 
    if (d.range) {
      return d.range[1] - d.range[0];
    } else {
      return 1;
    }
  }
};

module.exports = TreeUtils;